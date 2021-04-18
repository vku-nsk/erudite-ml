FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY ["Erudite.csproj", "./"]
RUN dotnet restore "Erudite.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "Erudite.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Erudite.csproj" -c Release -o /app/publish

FROM base AS final
EXPOSE 5000
ENV ASPNETCORE_URLS=http://*:5000
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Erudite.dll"]
