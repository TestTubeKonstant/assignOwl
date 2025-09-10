'use client'

import React, { useState, useEffect } from 'react'
import { Menu, User } from 'lucide-react'
import Sidebar from '../Sidebar/Sidebar'
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown'
import { ThemeProvider } from '@/app/contexts/ThemeContext'
import styles from './AuthenticatedLayout.module.scss'
import HomeScreen from '@/app/(authenticated)/chat/components/HomeScreen'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen)
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed)
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <ThemeProvider>
      <div className={styles.layout}>
        {/* Mobile Header - Always visible on mobile */}
        {isMobile && (
          <div className={styles.mobileHeader}>
            <button
              className={styles.mobileMenuButton}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </button>
                        
            <div className={styles.mobileActions}>
              <button
                className={styles.proButton}
                onClick={() => {/* Handle pro subscription */}}
                aria-label="Get Pro Subscription"
              >
                Get Pro
              </button>
              
              <ProfileDropdown 
                userName="John Doe"
                userEmail="john@example.com"
                onLogout={() => {
                  console.log('Logging out...')
                  // Add your logout logic here
                }}
                onSettings={() => {
                  console.log('Opening settings...')
                  // Add your settings logic here
                }}
                onHelp={() => {
                  console.log('Opening help...')
                  // Add your help logic here
                }}
              />
            </div>
          </div>
        )}

        {/* Backdrop for mobile */}
        {isMobile && isMobileMenuOpen && (
          <div 
            className={styles.backdrop}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          isMobileOpen={isMobileMenuOpen}
          onToggle={toggleSidebar}
          onMobileClose={closeMobileMenu}
        />
        
        <main className={`${styles.main} ${isSidebarCollapsed ? styles.expanded : ''} ${isMobile ? styles.withMobileHeader : ''}`}>
          <div className={styles.content}>
            <HomeScreen/>
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default AuthenticatedLayout
