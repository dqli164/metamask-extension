import EventEmitter from 'events';
import { bufferToHex } from 'ethereumjs-util';
import { HARDWARE_KEYRINGS } from '../../shared/constants/hardware-wallets';
import { buildUnserializedTxFromHex } from '../helpers/utils/transactions.util';
import { callBackgroundMethod } from './action-queue';

const processKeyringResponse = (res, method) => {
  if (method === 'signTransaction') {
    return res?.serialize ? bufferToHex(res.serialize()) : res;
  }

  return res;
};

const processArgs = (args, method) => {
  if (method === 'signTransaction') {
    return [args[0], buildUnserializedTxFromHex(args[1]), ...args.slice(2)];
  }

  return args;
};

export class ClientKeyringController extends EventEmitter {
  constructor() {
    super();
    this.keyrings = HARDWARE_KEYRINGS;
    // Avoid initializing keyrings until the background requests so
    this.keyringInstances = HARDWARE_KEYRINGS.map((KeyringClass) => {
      return new KeyringClass();
    });
  }

  /**
   * Get Keyring Class For Type
   *
   * Searches the current `keyring` array for a
   * Keyring class whose unique `type` property
   * matches the provided `type`, returning it
   * if it exists.
   *
   * @param {string} type - The type whose class to get.
   * @returns {Keyring|undefined} The class, if it exists.
   */
  getKeyringClassForType(type) {
    return this.keyrings.find((kr) => kr.type === type);
  }

  /**
   * Get Keyring Instance For Type
   *
   * @param {string} type - The type whose class to get.
   * @returns {Keyring|undefined} The class, if it exists.
   */
  getKeyringInstanceForType(type) {
    return this.keyringInstances.find((kr) => kr.type === type);
  }

  async updateKeyringData(type, data) {
    const keyring = this.getKeyringInstanceForType(type);

    if (!keyring) {
      console.error('updateKeyringData', type, data, this.keyringInstances);
    }

    await keyring.deserialize(data);

    console.log(`🖥️ updated keyring data`, data);
  }

  async getUpdatedKeyringData(type) {
    const keyring = this.getKeyringInstanceForType(type);
    const data = await keyring.serialize();

    return data;
  }

  async handleMethodCall({ type, method, args: _args, prevState, promiseId }) {
    const callback = (res, err) =>
      console.log('closeBackgroundPromise callback', res, err);
    await this.updateKeyringData(type, prevState);

    const args = processArgs(_args, method);
    const keyring = this.getKeyringInstanceForType(type);

    try {
      const _res = await keyring[method](...args);
      const res = processKeyringResponse(_res, method);
      const newState = await this.getUpdatedKeyringData(type);

      console.log(`✅🖥️ successful hardware call`, {
        res,
        newState,
        method,
        type: keyring.type,
      });

      callBackgroundMethod(
        'closeBackgroundPromise',
        [
          {
            promiseId,
            result: 'resolve',
            data: { newState, response: res },
          },
        ],
        callback,
      );
    } catch (e) {
      console.log(`❌🖥️ unsuccessful hardware call`, {
        method,
        type: keyring.type,
        e,
      });

      callBackgroundMethod(
        'closeBackgroundPromise',
        [
          {
            promiseId,
            result: 'reject',
            data: e.message || e.cause || String(e),
          },
        ],
        callback,
      );
    }
  }
}

let clientKeyringController; // poc purposes only

export const initializeClientKeyringController = () => {
  if (clientKeyringController) {
    console.log('ClientKeyringController already initialized, skipping.');
    return;
  }

  clientKeyringController = new ClientKeyringController();
};

export const handleHardwareCall = (params) => {
  initializeClientKeyringController();

  if (document.hasFocus()) {
    // Only process the request on the focused client
    clientKeyringController.handleMethodCall(params);
  }
};
