FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
#COPY: копируется всё на docker-vm
COPY . .
RUN dotnet restore "erudite-ml.sln"

WORKDIR "/src/."
RUN dotnet build "erudite-ml.sln" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "erudite-ml.sln" -c Release -o /app/publish

FROM base AS final
EXPOSE 5050
ENV ASPNETCORE_URLS=http://*:5050
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Erudite.dll"]