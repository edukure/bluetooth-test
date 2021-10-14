import React from 'react';
import {Button} from "@chakra-ui/react"



function Connect({onClick}) {
  
  // function isWebBluetoothEnabled() {
  //   if (!navigator.bluetooth) {
  //   console.log('Web Bluetooth API is not available in this browser!');
  //   log('Web Bluetooth API is not available in this browser!');
  //   return false
  //   }
  
  //   return true
  // }
  
  // React.useEffect(() => {
  //   console.log("isWebBluetoothEnabled", isWebBluetoothEnabled())
  // }, [])
  
  
  const handleClick = () => {
    
  }
  return <Button colorScheme="blue" onClick={onClick}>Connect BT</Button>
}

export default Connect;