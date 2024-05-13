import {createStore} from 'zustand/vanilla';
import {ConnectorConfig} from '../types/ConnectorConfig';
import {connectors} from '../connectors';
import {Connector} from '../connectors/Connector';
import {Route} from '../components/routes';
import {GetInfoResponse, WebLNProvider} from '@webbtc/webln-types';
import {
  BitcoinConnectConfig,
  DEFAULT_BITCOIN_CONNECT_CONFIG,
} from '../types/BitcoinConnectConfig';

interface Store {
  readonly route: Route;
  readonly routeHistory: Route[];
  readonly connected: boolean;
  readonly connecting: boolean;
  readonly supportsGetBalance: boolean | undefined;
  readonly connectorName: string | undefined;
  readonly error: string | undefined;
  readonly modalOpen: boolean;
  readonly provider: WebLNProvider | undefined;
  readonly currency: string | undefined;
  readonly connector: Connector | undefined;
  readonly connectorConfig: ConnectorConfig | undefined;
  readonly bitcoinConnectConfig: BitcoinConnectConfig;
  readonly info: GetInfoResponse | undefined;

  connect(config: ConnectorConfig): void;
  disconnect(): void;
  pushRoute(route: Route): void;
  popRoute(): void;
  setBitcoinConnectConfig(bitcoinConnectConfig: BitcoinConnectConfig): void;
  setError(error: string | undefined): void;
  clearRouteHistory(): void;
  setModalOpen(modalOpen: boolean): void;
  setCurrency(currency: string | undefined): void;

  // provider functions
  // getBalance(): Promise<number | undefined>;
  // getAlias(): Promise<string | undefined>;
}

const store = createStore<Store>((set, get) => ({
  route: '/start',
  routeHistory: [],
  modalOpen: false,
  currency: undefined,
  supportsGetBalance: false,
  connected: false,
  connecting: false,
  error: undefined,
  alias: undefined,
  balance: undefined,
  connectorName: undefined,
  invoice: undefined,
  provider: undefined,
  connector: undefined,
  connectorConfig: undefined,
  bitcoinConnectConfig: DEFAULT_BITCOIN_CONNECT_CONFIG,
  info: undefined,
  connect: async (connectorConfig: ConnectorConfig) => {
    set({
      connecting: true,
      error: undefined,
    });
    try {
      const connector = new connectors[connectorConfig.connectorType](
        connectorConfig
      );
      const provider = await connector.init();
      await provider.enable();
      let info: GetInfoResponse | undefined;
      try {
        info = await provider.getInfo();
      } catch (error) {
        console.error('Failed to request wallet info');
      }

      const canShowBalance =
        !!info?.methods &&
        info.methods.indexOf('getBalance') > -1 &&
        !!provider?.getBalance;

      set({
        connectorConfig: connectorConfig,
        connector,
        connected: true,
        connecting: false,
        info,
        supportsGetBalance: canShowBalance,
        provider,
        connectorName: connectorConfig.connectorName,
        route: '/start',
      });
      saveConfig(connectorConfig);
    } catch (error) {
      console.error(error);
      set({
        error: (error as Error).toString(),
        connecting: false,
      });
      get().disconnect();
      // TODO: throw new ConnectFailedError(error);
    }
  },
  disconnect: () => {
    get().connector?.unload();
    set({
      connectorConfig: undefined,
      connector: undefined,
      connected: false,
      connectorName: undefined,
      provider: undefined,
      modalOpen: false,
    });
    deleteConfig();
  },
  // TODO: support passing route parameters as a second argument
  pushRoute: (route: Route) => {
    if (get().route === route) {
      return;
    }
    set({route, routeHistory: [...get().routeHistory, get().route]});
  },
  popRoute() {
    const routeHistory = get().routeHistory;
    const newRoute = routeHistory.pop() || '/start';
    set({
      route: newRoute,
      routeHistory,
    });
  },
  clearRouteHistory() {
    set({
      route: '/start',
      routeHistory: [],
    });
  },
  setModalOpen: (modalOpen) => {
    set({modalOpen});
  },
  setBitcoinConnectConfig: (bitcoinConnectConfig) => {
    set({
      bitcoinConnectConfig: {
        ...DEFAULT_BITCOIN_CONNECT_CONFIG,
        ...bitcoinConnectConfig,
      },
    });
  },
  setError: (error) => {
    set({error});
  },
  setCurrency: (currency) => {
    if (currency) {
      window.localStorage.setItem('bc:currency', currency);
    } else {
      window.localStorage.removeItem('bc:currency');
    }
    set({currency});
  },
}));

export default store;

function deleteConfig() {
  window.localStorage.removeItem('bc:config');
}

function saveConfig(config: ConnectorConfig) {
  window.localStorage.setItem('bc:config', JSON.stringify(config));
}
