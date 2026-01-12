terraform {
  backend "azurerm" {
    resource_group_name  = "rg-etn-semaine-tfstate"
    storage_account_name = "stetnsemainetfstate"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
    use_oidc             = true
  }
}
