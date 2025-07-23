import { JsonRpcBatchProvider } from '@ethersproject/providers'
import invariant from 'tiny-invariant'

import { ChainId } from '../../constants'
import { Currency } from '../currency'
import { CurrencyAmount } from '../fractions/currencyAmount'
import { TokenAmount } from '../fractions/tokenAmount'
import { Token } from '../token'

/**
 * Same as `wrappedCurrency` util functiom, but for `TokenAmount`
 * @param currencyAmount The currency amount to wrap
 * @param chainId The chain ID
 * @returns The wrapped currency amount if it is native, otherwise the currency itself
 * @throws an error
 */
export function wrappedAmount(currencyAmount: CurrencyAmount, chainId: ChainId): TokenAmount {
  if (currencyAmount instanceof TokenAmount) return currencyAmount
  if (Currency.isNative(currencyAmount.currency))
    return new TokenAmount(Token.getNativeWrapper(chainId), currencyAmount.raw)
  invariant(false, 'CURRENCY')
}

/**
 * Returns the wrapped currency for the given currency if it is native
 * @param currency The currency to wrap
 * @param chainId The chain ID
 * @returns The wrapped currency if it is native, otherwise the currency itself
 * @throws an error
 */
export function wrappedCurrency(currency: Currency, chainId: ChainId): Token {
  if (currency instanceof Token) return currency
  if (Currency.isNative(currency)) return Token.getNativeWrapper(chainId)
  invariant(false, 'CURRENCY')
}

/**
 * Attempts to find the chain ID of the given currencies
 * @param currencyAmount The currency amount to find the chain ID for
 * @param currency The currency to find the chain ID for
 * @returns
 */
export function tryGetChainId(currencyAmount: CurrencyAmount, currency: Currency) {
  return currencyAmount instanceof TokenAmount
    ? currencyAmount.token.chainId
    : currency instanceof Token
      ? currency.chainId
      : undefined
}

/**
 * Default RPC provider URLs for different chains.
 * @see https://chainlist.org/ lookup Chain info
 */
export const DEFAULT_RPC_PROVIDER_LIST: Record<ChainId, string> = {
  [ChainId.ARBITRUM_GOERLI]: 'https://goerli-rollup.arbitrum.io/rpc',
  [ChainId.ARBITRUM_ONE]: 'https://arb1.arbitrum.io/rpc',
  [ChainId.ARBITRUM_RINKEBY]: 'https://rinkeby.arbitrum.io/rpc',
  [ChainId.BSC_MAINNET]: 'https://bsc-dataseed1.binance.org/',
  [ChainId.BSC_TESTNET]: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  [ChainId.GOERLI]: 'https://goerli.infura.io/v3/e1a3bfc40093494ca4f36b286ab36f2d',
  [ChainId.MAINNET]: 'https://eth.llamarpc.com',
  [ChainId.OPTIMISM_GOERLI]: 'https://goerli.optimism.io',
  [ChainId.OPTIMISM_MAINNET]: 'https://opt-mainnet.g.alchemy.com/v2/6cRVjVO2uOTC9gWFCsBnquUwOM9zuWQZ',
  [ChainId.POLYGON]: 'https://polygon-rpc.com',
  [ChainId.RINKEBY]: 'https://rinkeby.infura.io/v3/e1a3bfc40093494ca4f36b286ab36f2d',
  [ChainId.SCROLL_MAINNET]: 'https://rpc.scroll.io/ ',
  [ChainId.XDAI]: 'https://rpc.gnosischain.com',
  [ChainId.ZK_SYNC_ERA_MAINNET]: 'https://mainnet.era.zksync.io',
  [ChainId.ZK_SYNC_ERA_TESTNET]: 'https://testnet.era.zksync.dev',
}

/**
 * Global RPC configuration that can be set by consumers
 */
let customRpcProviders: Partial<Record<ChainId, string>> = {}

/**
 * Configure custom RPC providers for specific chains
 * @param providers Partial record of chain IDs to RPC URLs
 */
export function configureRpcProviders(providers: Partial<Record<ChainId, string>>) {
  customRpcProviders = { ...customRpcProviders, ...providers }
}

/**
 * Reset RPC providers to default values
 */
export function resetRpcProviders() {
  customRpcProviders = {}
}

/**
 * Get the effective RPC provider list (custom + defaults)
 */
export function getRpcProviderList(): Record<ChainId, string> {
  return { ...DEFAULT_RPC_PROVIDER_LIST, ...customRpcProviders }
}

/**
 * @deprecated Use DEFAULT_RPC_PROVIDER_LIST instead
 * @TODO in https://linear.app/swaprdev/issue/SWA-65/provide-a-single-source-of-truth-for-chain-rpcs-from-the-sdk
 * Make `RPC_PROVIDER_LIST` exportable from this repo
 */
export const RPC_PROVIDER_LIST: Record<ChainId, string> = DEFAULT_RPC_PROVIDER_LIST

/**
 * Returns a RPC provider for the given chainId.
 * Caches the provider so repeated calls for the same chainId return the same instance.
 * @param chainId The chainId
 * @returns The RPC provider
 */
const providerCache: Partial<Record<ChainId, JsonRpcBatchProvider>> = {}
export function getProvider(chainId: ChainId) {
  if (providerCache[chainId]) {
    return providerCache[chainId]!
  }
  const host = getRpcProviderList()[chainId]
  const provider = new JsonRpcBatchProvider(host)
  providerCache[chainId] = provider
  return provider
}
