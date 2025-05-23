import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import { Provider } from "react-redux";
import store from "./Redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

const root = ReactDOM.createRoot(document.getElementById("root"));

let persistor = persistStore(store);

root.render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
