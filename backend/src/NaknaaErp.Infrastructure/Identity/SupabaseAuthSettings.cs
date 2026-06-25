namespace NaknaaErp.Infrastructure.Identity;

public class SupabaseAuthSettings
{
    public const string SectionName = "Supabase";

    public string ProjectUrl { get; set; } = string.Empty;
    public string JwtSecret { get; set; } = string.Empty;
    public string JwtAudience { get; set; } = "authenticated";

    public bool IsAuthConfigured =>
        !string.IsNullOrWhiteSpace(ProjectUrl) &&
        !string.IsNullOrWhiteSpace(JwtSecret);

    public string JwtIssuer =>
        $"{ProjectUrl.TrimEnd('/')}/auth/v1";
}
