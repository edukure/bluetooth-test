/* Web Bluetooth API needs https
  https://blog.eperedo.com/2020/03/22/nextjs-ngrok-easy-https-server/
*/

import { useState, useEffect, useRef, useCallback } from 'react';

function useBluetooth(deviceName, bleService, bleCharacteristic, maxBufferSize = 100) {
  const [value, setValue] = useState<number>();
  const [values, setValues] = useState<{ id: number; value: number | string }[]>([]);
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice>(null);
  const [gattCharacteristic, setGattCharacteristic] =
    useState<BluetoothRemoteGATTCharacteristic>(null);
  const [isReady, setIsReady] = useState(false);
  const [errors, setErrors] = useState('');

  const buffer = useRef([]);
  const dataCount = useRef(0);

  useEffect(() => {
    isWebBluetoothEnabled();

    return () => {
      if (gattCharacteristic) {
        gattCharacteristic.stopNotifications().then(() => {
          gattCharacteristic.removeEventListener('characteristicvaluechanged', handleChangedValue);
        });
      }
    };
  }, []);

  const isWebBluetoothEnabled = useCallback(() => {
    if (!navigator.bluetooth) {
      console.log('Web Bluetooth API is not available in this browser!');
      setErrors('Web Bluetooth API is not available in this browser!');
      return false;
    }

    return true;
  }, []);

  const getDeviceInfo = useCallback(async () => {
    const options = {
      optionalServices: [bleService],
      filters: [{ name: deviceName }],
    };

    // change to status?
    console.log('Requesting any Bluetooth Device...');
    if (!isWebBluetoothEnabled()) return null;

    const device = await navigator.bluetooth?.requestDevice(options);
    if (!device) {
      setErrors('oops');
      return null;
    }
    setBluetoothDevice(device);
    return device;
  }, []);

  /*
    Connects to GATTServer once the device is set.
  */
  useEffect(() => {
    if (bluetoothDevice) {
      connectGATT();
    }
  }, [bluetoothDevice]);

  /*
    Connecting to GATTServer is asynchronous and takes around 5 seconds.
    The device is ready to transmit data when gattCharacteristic is set.
  */
  useEffect(() => {
    if (gattCharacteristic) {
      setIsReady(true);
    }
  }, [gattCharacteristic]);

  const connectGATT = useCallback(async () => {
    if (bluetoothDevice?.gatt.connected && !gattCharacteristic) {
      return;
    }

    const server = await bluetoothDevice.gatt.connect();
    const primaryService = await server.getPrimaryService(bleService);
    const characteristic = await primaryService.getCharacteristic(bleCharacteristic);
    // characteristic.addEventListener('characteristicvaluechanged', handleChangedValue);
    setGattCharacteristic(characteristic);
  }, [bluetoothDevice, gattCharacteristic]);

  const read = useCallback(async () => {
    if (bluetoothDevice?.gatt.connected && !gattCharacteristic) {
      return;
    }

    return gattCharacteristic.readValue();
  }, [bluetoothDevice, gattCharacteristic]);

  const handleChangedValue = useCallback((event) => {
    const decodedString = new TextDecoder().decode(event.target.value.buffer);
    const resultFromSplit = decodedString.split(';');

    const mappedValues = resultFromSplit.map((value) => {
      const id = dataCount.current;
      dataCount.current += 1;
      return {
        id,
        value,
      };
    });

    setValues((prev) => [...prev, ...mappedValues]);

    // this was used when single ints where sent by esp32
    // let value = event.target.value.getInt16(1);
    // if (buffer.current.length < maxBufferSize) {
    //   buffer.current.push(`> ${dataCount.current}: ${value}`);
    //   dataCount.current += 1;
    // }

    // if (buffer.current.length === maxBufferSize) {
    //   setValues((prev) => [...prev, ...buffer.current]);
    //   buffer.current = [];
    // }
  }, []);

  const start = useCallback(async () => {
    if (isReady) {
      gattCharacteristic.addEventListener('characteristicvaluechanged', handleChangedValue);
      await gattCharacteristic.startNotifications();
      console.log('Start reading...');
    } else {
      console.log('not ready');
    }
  }, [gattCharacteristic, isReady]);

  const stop = useCallback(async () => {
    await gattCharacteristic.stopNotifications();
    console.log('Stop reading...');
  }, [gattCharacteristic]);

  return {
    value,
    values,
    getDeviceInfo,
    connectGATT,
    start,
    stop,
    errors,
    isWebBluetoothEnabled,
    isReady,
  };
}

export default useBluetooth;
