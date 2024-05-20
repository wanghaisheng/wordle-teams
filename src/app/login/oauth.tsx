'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { createClient } from '@/lib/supabase/client'
import { getOAuthProviderName } from '@/lib/utils'
import { Provider } from '@supabase/supabase-js'
import { Facebook, Github, Google, Microsoft, Slack, WorkOS } from './oauth-icons'

const getRedirect = () => {
  switch (process.env.NEXT_PUBLIC_VERCEL_ENV) {
    case 'preview':
    case 'development':
      return 'https://dev.wordleteams.com/auth/callback'
    case 'local':
      return 'http://localhost:3000/auth/callback'
    default:
      return 'https://wordleteams.com/auth/callback'
  }
}

export default function OAuthLogin({ provider }: { provider: Provider }) {
  const supabase = createClient()
  const redirectTo = getRedirect()
  const providerName = getOAuthProviderName(provider)
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type='button' onClick={handleLogin} variant={'outline'} className='py-6'>
            {provider === 'github' && <Github className='mr-2 h-5 w-5' />}
            {provider === 'google' && <Google className='mr-2 h-5 w-5' />}
            {provider === 'facebook' && <Facebook className='mr-2 h-5 w-5' />}
            {provider === 'azure' && <Microsoft className='mr-2 h-5 w-5' />}
            {provider === 'slack' && <Slack className='mr-2 h-5 w-5' />}
            {provider === 'workos' && <WorkOS className='mr-2 h-5 w-5' />}
            <span className='sr-only'>Sign in with {providerName}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{providerName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
