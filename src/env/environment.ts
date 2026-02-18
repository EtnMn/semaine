// Production environment - values will be injected via Azure Static Web Apps configuration
// Real credentials are stored in GitHub Secrets and injected at build time
export const environment = {
  production: true,
  supabase: {
    url: "",
    key: "",
  },
};
