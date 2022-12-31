import { MpStore } from './metapebble';
import { GodStore } from './god';
import { UserStore } from './user';
import { TransactionHistoryStore } from './history';
export default class RootStore {
  mpStore = new MpStore(this);
  god = new GodStore(this);
  user = new UserStore(this);
  history = new TransactionHistoryStore(this);
}
