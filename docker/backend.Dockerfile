# Stage 1: Build & Restore dependencies
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for caching package restores
COPY ["backend/src/Domain/AdeelDevPlatform.Domain.csproj", "backend/src/Domain/"]
COPY ["backend/src/Application/AdeelDevPlatform.Application.csproj", "backend/src/Application/"]
COPY ["backend/src/Infrastructure/AdeelDevPlatform.Infrastructure.csproj", "backend/src/Infrastructure/"]
COPY ["backend/src/Api/AdeelDevPlatform.Api.csproj", "backend/src/Api/"]

RUN dotnet restore "backend/src/Api/AdeelDevPlatform.Api.csproj"

# Copy the entire workspace files
COPY . .

# Set working directory to the API project and compile
WORKDIR "/src/backend/src/Api"
RUN dotnet build "AdeelDevPlatform.Api.csproj" -c Release -o /app/build

# Stage 2: Publish compiled DLLs
FROM build AS publish
RUN dotnet publish "AdeelDevPlatform.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Run target build using ASP.NET Core lightweight runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AdeelDevPlatform.Api.dll"]
