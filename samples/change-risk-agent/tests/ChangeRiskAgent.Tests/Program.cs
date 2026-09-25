using ChangeRiskAgent;

var failures = new List<string>();
await Check("known safe change is low risk", async () =>
{
    var result = await Advisor().AssessAsync("CHG-1001", CancellationToken.None);
    Expect(result.Contains("Classification: low", StringComparison.Ordinal), result);
    Expect(result.Contains("human release engineer", StringComparison.Ordinal), result);
});
await Check("failed tests fail closed", async () =>
{
    var result = await Advisor().AssessAsync("CHG-1002", CancellationToken.None);
    Expect(result.Contains("Classification: high", StringComparison.Ordinal), result);
    Expect(!result.Contains("approve", StringComparison.OrdinalIgnoreCase), result);
});
await Check("unknown change is insufficient evidence", async () =>
{
    var result = await Advisor().AssessAsync("CHG-9999", CancellationToken.None);
    Expect(result.Contains("insufficient-evidence", StringComparison.Ordinal), result);
});
await Check("malformed ID is rejected before lookup", async () =>
{
    try
    {
        await Advisor().AssessAsync("../secret", CancellationToken.None);
        throw new Exception("Expected malformed ID rejection.");
    }
    catch (ArgumentException)
    {
    }
});
await Check("cancellation stops the tool loop", async () =>
{
    using var cancellation = new CancellationTokenSource();
    cancellation.Cancel();
    try
    {
        await Advisor().AssessAsync("CHG-1001", cancellation.Token);
        throw new Exception("Expected cancellation.");
    }
    catch (OperationCanceledException)
    {
    }
});

if (failures.Count > 0)
{
    Console.Error.WriteLine(string.Join(Environment.NewLine, failures));
    return 1;
}
Console.WriteLine("PASS: 5 change-risk-agent checks");
return 0;

ChangeRiskAdvisor Advisor()
{
    var dataPath = Path.GetFullPath(Path.Combine(
        AppContext.BaseDirectory,
        "..", "..", "..", "..", "..",
        "src", "ChangeRiskAgent", "Data", "change-requests.json"));
    return new ChangeRiskAdvisor(new ChangeRecordTool(dataPath), new DeterministicAdvisoryModel());
}

async Task Check(string name, Func<Task> action)
{
    try
    {
        await action();
    }
    catch (Exception error)
    {
        failures.Add($"FAIL: {name}: {error.Message}");
    }
}

static void Expect(bool condition, string message)
{
    if (!condition) throw new Exception(message);
}
