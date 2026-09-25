using System.Text.Json;

namespace ChangeRiskAgent;

public sealed record ChangeRecord(
    string Id,
    string Summary,
    string Service,
    string Environment,
    string TestStatus,
    bool RollbackPlanPresent,
    bool ObservabilityPlanPresent,
    string CustomerImpact);

public sealed record ToolResult(string Status, string ChangeId, ChangeRecord? Change, string? Message);

public interface IAdvisoryModel
{
    Task<string> ComposeAsync(ToolResult evidence, CancellationToken cancellationToken);
}

public sealed class ChangeRiskAdvisor(ChangeRecordTool tool, IAdvisoryModel model)
{
    public async Task<string> AssessAsync(string changeId, CancellationToken cancellationToken)
    {
        var evidence = await tool.ExecuteAsync(changeId, cancellationToken);
        return await model.ComposeAsync(evidence, cancellationToken);
    }
}

public sealed class DeterministicAdvisoryModel : IAdvisoryModel
{
    public Task<string> ComposeAsync(ToolResult evidence, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (evidence.Status != "found" || evidence.Change is null)
        {
            return Task.FromResult(string.Join(Environment.NewLine,
                $"Change: {evidence.ChangeId}",
                "Classification: insufficient-evidence",
                "Factors: no authoritative change record was retrieved",
                $"Missing evidence: {evidence.Message ?? "change record"}",
                "Next action: a human release engineer must verify the change record."));
        }

        var change = evidence.Change;
        var factors = new List<string>();
        var classification = "low";
        if (!string.Equals(change.TestStatus, "passed", StringComparison.OrdinalIgnoreCase))
        {
            classification = "high";
            factors.Add($"test_status={change.TestStatus}");
        }
        if (!change.RollbackPlanPresent)
        {
            classification = classification == "high" ? "high" : "medium";
            factors.Add("rollback_plan_present=false");
        }
        if (!change.ObservabilityPlanPresent)
        {
            classification = classification == "high" ? "high" : "medium";
            factors.Add("observability_plan_present=false");
        }
        if (factors.Count == 0)
        {
            factors.Add("tests passed");
            factors.Add("rollback plan present");
            factors.Add("observability plan present");
        }

        return Task.FromResult(string.Join(Environment.NewLine,
            $"Change: {change.Id}",
            $"Classification: {classification}",
            $"Factors: {string.Join("; ", factors)}",
            $"Missing evidence: {(classification == "low" ? "none in the synthetic record" : "resolve the cited gaps")}",
            "Next action: a human release engineer must review this advisory before deployment."));
    }
}

public sealed class ChangeRecordTool
{
    private readonly IReadOnlyDictionary<string, ChangeRecord> records;

    public ChangeRecordTool(string dataPath)
    {
        const int maximumFixtureBytes = 256 * 1024;
        var info = new FileInfo(dataPath);
        if (!info.Exists) throw new FileNotFoundException("Synthetic change data is missing.", dataPath);
        if (info.Length > maximumFixtureBytes) throw new InvalidDataException("Synthetic change data is too large.");
        var loaded = JsonSerializer.Deserialize<List<ChangeRecord>>(
            File.ReadAllText(dataPath),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];
        records = loaded.ToDictionary(record => Normalize(record.Id), StringComparer.OrdinalIgnoreCase);
    }

    public Task<ToolResult> ExecuteAsync(string changeId, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var normalized = Normalize(changeId);
        if (records.TryGetValue(normalized, out var record))
        {
            return Task.FromResult(new ToolResult("found", normalized, record, null));
        }
        return Task.FromResult(new ToolResult(
            "not_found",
            normalized,
            null,
            "No synthetic change record exists for the requested ID."));
    }

    private static string Normalize(string value)
    {
        var normalized = value?.Trim().ToUpperInvariant() ?? string.Empty;
        if (normalized.Length != 8 ||
            !normalized.StartsWith("CHG-", StringComparison.Ordinal) ||
            !normalized.AsSpan(4).ToString().All(char.IsAsciiDigit))
        {
            throw new ArgumentException("Change ID must match CHG-0000.", nameof(value));
        }
        return normalized;
    }
}
