'use server'

import { createAdminClient, createClient } from '@/lib/supabase/actions'
import { getSession } from '@/lib/utils'
import { log } from 'next-axiom'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function createTeam(formData: FormData) {
  const supabase = createClient(cookies())
  const session = await getSession(supabase)
  if (!session) throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const playWeekends = (formData.get('playWeekends') as string) === 'on'
  const creator = session.user.id

  const { data, error } = await supabase
    .from('teams')
    .insert({ name, play_weekends: playWeekends, creator, player_ids: [creator] })
    .select('*')
    .single()

  if (error) {
    log.error('Failed to insert team', { error })
    return { success: false, message: 'Team creation failed, please try again' }
  }

  revalidatePath('/me', 'page')
  return { success: true, message: 'Successfully created team', newTeam: data }
}

export async function deleteTeam(teamId: string) {
  const supabase = createClient(cookies())
  const session = await getSession(supabase)
  if (!session) throw new Error('Unauthorized')

  const { error } = await supabase.from('teams').delete().eq('id', teamId)

  if (error) {
    log.error('Failed to delete team', { error })
    return { success: false, message: 'Team deletion failed, please try again' }
  }

  revalidatePath('/me', 'page')
  return { success: true, message: 'Successfully deleted team' }
}

export async function invitePlayer(formData: FormData) {
  const supabase = createAdminClient(cookies())
  const session = await getSession(supabase)
  if (!session) throw new Error('Unauthorized')

  const teamId = formData.get('teamId') as string
  const playerIds = formData.getAll('playerIds') as string[]
  const invited = formData.getAll('invited') as string[]
  const email = formData.get('email') as string

  const { data: players, error } = await supabase.from('players').select('*').eq('email', email)

  if (players && players[0]) {
    if (!playerIds.includes(players[0].id)) {
      const newPlayerIds = playerIds.length > 0 ? [...playerIds, players[0].id] : [players[0].id]
      const { error } = await supabase
        .from('teams')
        .update({ player_ids: newPlayerIds })
        .eq('id', teamId)
        .select('*')
      if (error) {
        log.error(`Failed to fetch team ${teamId}`, { error })
        return { success: false, message: 'Player invite failed' }
      }
    } else log.info(`Player with email ${email} already on team ${teamId}`)
  } else {
    const { error } = await supabase.auth.admin.inviteUserByEmail(email)
    if (error) {
      log.error('Failed to send invite email', { error })
      return { success: false, message: 'Player invite failed' }
    }
    const newInvited = [...invited, email]
    const { error: teamUpdateError } = await supabase
      .from('teams')
      .update({ invited: newInvited })
      .eq('id', teamId)
      .select('*')
    if (teamUpdateError) {
      log.error('team update error', { teamUpdateError })
      return { success: false, message: 'Player invite failed' }
    }
  }

  if (error) {
    log.error('An unexpected error occurred while trying to invite player', { error })
    return { success: false, message: 'Player invite failed' }
  }

  revalidatePath('/me', 'page')
  return { success: true, message: 'Successfully invited player' }
}

export async function upsertBoard(formData: FormData) {
  const supabase = createClient(cookies())
  const session = await getSession(supabase)
  if (!session) throw new Error('Unauthorized')

  const scoreId = formData.get('scoreId') as string
  const scoreDate = formData.get('scoreDate') as string
  const answer = formData.get('answer') as string
  const guessesInput = formData.getAll('guesses') as string[]
  const guesses = guessesInput[0].split(',').filter((g) => g !== '')

  let dailyScore
  let message

  if (!!scoreId && scoreId !== '-1') {
    const { data: newScore, error } = await supabase
      .from('daily_scores')
      .update({ answer, guesses })
      .eq('id', scoreId)
      .select('*')
      .single()

    if (error) {
      log.error('Failed to add or update board', { error })
      return { success: false, message: 'Failed to add or update board' }
    }
    dailyScore = newScore
    message = 'Successfully updated board'
  } else {
    const { data: newScore, error } = await supabase
      .from('daily_scores')
      .insert({ answer, date: scoreDate, guesses, player_id: session.user.id })
      .select('*')
      .single()

    if (error) {
      log.error('Failed to add or update board', { error })
      return { success: false, message: 'Failed to add or update board' }
    }
    dailyScore = newScore
    message = 'Successfully added board'
  }

  revalidatePath('/')

  return { success: true, message }
}
