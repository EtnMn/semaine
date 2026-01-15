terraform {
  backend "azurerm" {
    resource_group_name  = "rg-etn-semaine-tfstate"
    storage_account_name = "stetnsemaine32658"
    container_name       = "tfstateprod"
    key                  = "semaine.tfstate"
  }
}
