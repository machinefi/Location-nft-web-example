import { makeAutoObservable, observable, action } from 'mobx';
import { BooleanState } from './base';
import { v4 as uuid } from 'uuid';

export class PromiseState<T extends (...args: any[]) => Promise<any>, U = ReturnType<T>> {
  loading = new BooleanState({ value: false });
  disposableLoading = new BooleanState({ value: true });
  value?: Awaited<U> = null;
  cache?: {
    getKey: () => string;
    ttl: number; //seconds
  } = null;
  function: T;
  name: string = uuid();
  context: any = undefined;
  autoAlert: boolean = true;

  id: Function;

  constructor(args: Partial<PromiseState<T, U>> = {}) {
    try {
      Object.assign(this, args);
      makeAutoObservable(this);
    } catch (error) {
      console.log(args);
      console.log(error.message);
    }
  }

  setValue(value: Awaited<U>) {
    this.value = value;
  }

  async forceCall(...args: Parameters<T>): Promise<Awaited<U>> {
    const res = await this.call(...args);
    return res;
  }

  async call(...args: Parameters<T>): Promise<Awaited<U>> {
    // if (this.promiseLoading.value) return;
    try {
      this.loading.setValue(true);
      console.log('promise state call', this.loading.value);
      // if (this.cache) {
      //   this.cacheState = new CacheState({
      //     id: this.cache.getKey()
      //   });
      //   let localCacheRes = await this.cacheState.get();
      //   if (localCacheRes && (localCacheRes.timestamp + this.cache.ttl) * 1000 > Date.now()) {
      //     this.value = localCacheRes.value;
      //     return localCacheRes.value;
      //   }
      // }
      const res = await this.function.apply(this.context, args);
      this.setValue(res);
      // if (this.cache) {
      //   this.cacheState.setValue('timestamp', Math.floor(Date.now() / 1000));
      //   this.cacheState.setValue('value', res);
      //   this.cacheState.save();
      // }
      this.disposableLoading.setValue(false);
      this.loading.setValue(false);
      return res;
    } catch (error) {
      console.error(error);
      this.loading.setValue(false);
      this.disposableLoading.setValue(false);
      if (this.autoAlert) {
        // toast.error(error.data?.message || error.message);
      }
      // throw new Error(error);
    }
  }
}
