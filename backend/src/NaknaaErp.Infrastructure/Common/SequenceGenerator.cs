using Microsoft.EntityFrameworkCore;
using NaknaaErp.Infrastructure.Persistence;

namespace NaknaaErp.Infrastructure.Common;

public static class SequenceGenerator
{
    public static async Task<string> NextAsync(
        ApplicationDbContext context,
        string counterKey,
        string prefix,
        string format,
        CancellationToken cancellationToken = default)
    {
        var setting = await context.AppSettings
            .FirstOrDefaultAsync(x => x.Category == "Counters" && x.Key == counterKey, cancellationToken);

        var next = 1;
        if (setting is null)
        {
            setting = new Domain.Entities.AppSetting
            {
                Category = "Counters",
                Key = counterKey,
                Value = "1"
            };
            context.AppSettings.Add(setting);
        }
        else
        {
            next = int.TryParse(setting.Value, out var current) ? current + 1 : 1;
            setting.Value = next.ToString();
            context.AppSettings.Update(setting);
        }

        await context.SaveChangesAsync(cancellationToken);

        var year = DateTime.UtcNow.Year;
        return format
            .Replace("{prefix}", prefix, StringComparison.OrdinalIgnoreCase)
            .Replace("{year}", year.ToString(), StringComparison.OrdinalIgnoreCase)
            .Replace("{sequence}", next.ToString("D6"), StringComparison.OrdinalIgnoreCase)
            .Replace("{seq}", next.ToString("D6"), StringComparison.OrdinalIgnoreCase);
    }
}
