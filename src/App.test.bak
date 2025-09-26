import { render, screen } from "@testing-library/react";
import App from "./App";
import { CardStorageProviderComponent } from "./Hooks/useCardStorage";
import { DataSourceStorageProviderComponent } from "./Hooks/useDataSourceStorage";
import { FirebaseProviderComponent } from "./Hooks/useFirebase";
import { SettingsStorageProviderComponent } from "./Hooks/useSettingsStorage";

xtest("renders appjs", () => {
  render(
    <SettingsStorageProviderComponent>
      <DataSourceStorageProviderComponent>
        <CardStorageProviderComponent>
          <FirebaseProviderComponent>
            <App />
          </FirebaseProviderComponent>
        </CardStorageProviderComponent>
      </DataSourceStorageProviderComponent>
    </SettingsStorageProviderComponent>
  );
});
