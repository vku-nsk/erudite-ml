using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using VueCliMiddleware;
using Erudite.Data;
using Erudite.Services;
using Microsoft.EntityFrameworkCore;

namespace Erudite
{
  public class Startup
  {
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    public IConfiguration Configuration { get; }
    
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddRazorPages();
      services.AddControllers();

      services.AddDbContext<EruditeDbContext>( opts =>
        {
          opts.EnableDetailedErrors();
          opts.UseNpgsql(Configuration.GetConnectionString("EruditeDb.dev"));
        }
      );

      services.AddTransient<IDictionaryService, DictionaryService>();
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
      if (env.IsDevelopment())
      {
          app.UseDeveloperExceptionPage();
      }

      app.UseStaticFiles();

      app.UseRouting();

      app.UseEndpoints(endpoints =>
      {
        endpoints.MapRazorPages();
        endpoints.MapControllers();

        // Only do for development
        if (env.IsDevelopment())
        {
          endpoints.MapToVueCliProxy(
            "{*path}",
            new SpaOptions
            {
              SourcePath = "../robo-erudite"
            },
            npmScript: "watch",
            regex: "Compiled successfully",
            forceKill: true
            );
        }
      });     
    }
  }
}
