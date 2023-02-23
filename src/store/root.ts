import { MpStore } from './metapebble';
import { erc20Store } from './erc20';
import { nftStore } from './nft';
import { checkInStore } from './checkIn';
import { GodStore } from './god';
import { UserStore } from './user';
import { TransactionHistoryStore } from './history';
export default class RootStore {
  mpStore = new MpStore(this);
  erc20Store = new erc20Store(this);
  nftStore = new nftStore(this);
  checkInStore = new checkInStore(this);
  god = new GodStore(this);
  user = new UserStore(this);
  history = new TransactionHistoryStore(this);
}
