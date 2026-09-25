using Xunit;

namespace ModelRoutingAdvisor.Tests;

public sealed class FoundryConfigurationTests
{
    [Fact]
    public void ProjectEndpointUsesFoundryTokenAudience()
    {
        Assert.Equal(
            "https://ai.azure.com/.default",
            FoundryModelTransport.TokenScope);
    }

    [Fact]
    public void ProjectEndpointIsNormalizedForRelativeDataPlanePaths()
    {
        var originalEndpoint = Environment.GetEnvironmentVariable(FoundryOptions.EndpointVariable);
        var originalLow = Environment.GetEnvironmentVariable(FoundryOptions.LowCostDeploymentVariable);
        var originalHigh = Environment.GetEnvironmentVariable(FoundryOptions.HighCapabilityDeploymentVariable);

        try
        {
            Environment.SetEnvironmentVariable(
                FoundryOptions.EndpointVariable,
                "https://example.invalid/api/projects/example-project");
            Environment.SetEnvironmentVariable(FoundryOptions.LowCostDeploymentVariable, "low");
            Environment.SetEnvironmentVariable(FoundryOptions.HighCapabilityDeploymentVariable, "high");

            var options = FoundryOptions.FromEnvironment();

            Assert.Equal(
                "https://example.invalid/api/projects/example-project/",
                options.Endpoint.AbsoluteUri);
        }
        finally
        {
            Environment.SetEnvironmentVariable(FoundryOptions.EndpointVariable, originalEndpoint);
            Environment.SetEnvironmentVariable(FoundryOptions.LowCostDeploymentVariable, originalLow);
            Environment.SetEnvironmentVariable(FoundryOptions.HighCapabilityDeploymentVariable, originalHigh);
        }
    }
}
