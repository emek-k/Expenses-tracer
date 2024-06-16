public class RedirectMiddleware
{
    private readonly RequestDelegate _next;

    public RedirectMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.Redirect("/");
            return;
        }

        await _next(context);

        if (context.Response.StatusCode == 404)
        {
            context.Response.Redirect("/");
        }
    }
}