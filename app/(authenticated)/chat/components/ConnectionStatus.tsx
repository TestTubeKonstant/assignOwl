'use client'

import React from 'react'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { useIsConnected, useIsConnecting, useSocketError } from '@/app/socket/socketStore'
import styles from './ConnectionStatus.module.scss'

const ConnectionStatus: React.FC = () => {
  const isConnected = useIsConnected()
  const isConnecting = useIsConnecting()
  const error = useSocketError()

  if (isConnecting) {
    return (
      <div className={`${styles.status} ${styles.connecting}`}>
        <Loader2 size={14} className={styles.spinner} />
        <span>Connecting...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.status} ${styles.error}`}>
        <WifiOff size={14} />
        <span>Connection Error</span>
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className={`${styles.status} ${styles.connected}`}>
        <Wifi size={14} />
        <span>Real-time</span>
      </div>
    )
  }

  return (
    <div className={`${styles.status} ${styles.offline}`}>
      <WifiOff size={14} />
      <span>Offline Mode</span>
    </div>
  )
}

export default ConnectionStatus