'use client'

import { cn, padArray } from '@/lib/utils'

const countLetters = (str: string, letter: string) => str?.split('')?.filter(char => char === letter)?.length ?? 0

type WordleBoardProps = {
  guesses: string[]
  answer: string
}

export default function WordleBoard({ guesses, answer }: WordleBoardProps) {
  const guessList = guesses.length === 6 ? guesses : padArray(guesses, 6)
  return (
    <div className='pt-1'>
      {guessList.map(
        (guess, index) =>
          index < 6 && (
            <div id={`word-${index}`} key={`word-${index}`} className='flex justify-center'>
              <div className='grid grid-cols-5 gap-1 mb-1 w-72 md:w-80'>
                <LetterBox answer={answer} letter={guess[0]} letterIndex={0} wordNum={index + 1} letterCount={countLetters(guess, guess[0])} />
                <LetterBox answer={answer} letter={guess[1]} letterIndex={1} wordNum={index + 1} letterCount={countLetters(guess, guess[1])} />
                <LetterBox answer={answer} letter={guess[2]} letterIndex={2} wordNum={index + 1} letterCount={countLetters(guess, guess[2])} />
                <LetterBox answer={answer} letter={guess[3]} letterIndex={3} wordNum={index + 1} letterCount={countLetters(guess, guess[3])} />
                <LetterBox answer={answer} letter={guess[4]} letterIndex={4} wordNum={index + 1} letterCount={countLetters(guess, guess[4])} />
              </div>
            </div>
          )
      )}
    </div>
  )
}

type LetterBoxProps = {
  answer: string
  letter: string
  letterIndex: number
  wordNum: number
  letterCount: number
}

function LetterBox({ answer, letter, letterIndex, wordNum, letterCount }: LetterBoxProps) {
  const getConditionalClasses = () => {
    if (!letter) return ''
    if (!answer.includes(letter)) return 'bg-muted'
    if (answer[letterIndex] === letter) return 'bg-green-600 dark:bg-green-700'
    if (answer.includes(letter)) {
      const countInAnswer = countLetters(answer, letter)
      return letterCount <= countInAnswer ? 'bg-yellow-400 dark:bg-yellow-500' : 'bg-muted'
    }
    return ''
  }
  const letterNum = letterIndex + 1

  return (
    <div
      className={cn(
        'border h-14 md:h-16 text-3xl md:text-4xl uppercase caret-transparent flex justify-center items-center',
        getConditionalClasses()
      )}
      id={`${wordNum}-${letterNum}`}
    >
      {letter}
    </div>
  )
}
