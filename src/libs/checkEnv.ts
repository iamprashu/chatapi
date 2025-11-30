export default function validateEnv() {
  const requiredVars = [
    "MONGO_URL",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "PORT",
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      "Server cannot start. Missing environment variables:",
      missing.join(", ")
    );
    process.exit(1);
  }
}
