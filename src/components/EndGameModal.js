import Modal from 'react-modal'
import { useEffect, useState } from 'react'
import { status } from '../constants'
import Success from '../data/Success.png'
import Fail from '../data/Cross.png'
import WIP from '../data/WIP3.png'

Modal.setAppElement('#root')

export const EndGameModal = ({
  isOpen,
  handleClose,
  styles,
  darkMode,
  gameState,
  state,
  currentStreak,
  longestStreak,
  answer,
  playAgain,
  day,
  currentRow,
  cellStatuses,
}) => {
  const CloseButton = () => {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <button
          type="button"
          className="rounded px-6 py-2 mt-8 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
          onClick={playAgain}
        >
          Close
        </button>
      </div>
    )
  }

  function GetDefinition() {
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [items, setItems] = useState([])

    useEffect(() => {
      const urlApi = 'https://api.dictionaryapi.dev/api/v2/entries/en/' + answer
      fetch(urlApi)
        .then((res) => res.json())
        .then(
          (result) => {
            setIsLoaded(true)
            setItems(result)
            console.log('URL  > ' + urlApi)
            console.log(result)
          },
          (error) => {
            setIsLoaded(true)
            setError(error)
          }
        )
    }, [])

    if (error) {
      return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
      return <div>Loading...</div>
    } else {
      return (
        <>
          {items.map((levelOneJson, a) => (
            <ul key={levelOneJson.word}>
              <li>
                {levelOneJson.meanings.map((levelTwoJson) => (
                  <ul key={levelTwoJson.partOfSpeech}>
                    <li>
                      <strong>{levelOneJson.word}</strong> ({levelTwoJson.partOfSpeech})
                      {levelTwoJson.definitions.map((levelThreeJson) => (
                        <ul key={levelThreeJson.definition}>
                          <li> * {levelThreeJson.definition}</li>
                        </ul>
                      ))}
                    </li>
                  </ul>
                ))}
              </li>
            </ul>
          ))}
        </>
      )
    }
  }

  function getOccurrence(array, value) {
    var count = 0
    if (array) {
      for (let i = 0; i < array.length; i++) {
        if (array[i].state === value) {
          count += 1
        }
      }
    }
    return count
  }

  const gameStateList = JSON.parse(localStorage.getItem('gameStateList'))
  var wins = getOccurrence(gameStateList, 'won')
  var losses = getOccurrence(gameStateList, 'lost')

  const ShareButton = (props) => {
    const [buttonPressed, setButtonPressed] = useState(false)
    useEffect(() => {
      if (buttonPressed !== false) {
        setTimeout(() => setButtonPressed(false), [3000])
      }
    }, [buttonPressed])
    return (
      <button
        type="button"
        className="rounded px-6 py-2 mt-8 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
        onClick={() => {
          setButtonPressed(true)
          navigator.clipboard.writeText(
            `Wordle ${day} ${gameState === state.won ? currentRow : 'X'}/6\n\n` +
              cellStatuses
                .map((row) => {
                  if (row.every((item) => item !== status.unguessed)) {
                    return (
                      row
                        .map((state) => {
                          switch (state) {
                            case status.gray:
                              if (darkMode) {
                                return '⬛'
                              } else {
                                return '⬜'
                              }
                            case status.green:
                              return '🟩'
                            case status.yellow:
                              return '🟨'
                            default:
                              return '  '
                          }
                        })
                        .join('') + '\n'
                    )
                  } else {
                    return ''
                  }
                })
                .join('')
          )
        }}
      >
        {buttonPressed ? 'Copied!' : 'Share'}
      </button>
    )
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={styles}
      contentLabel="Game End Modal"
    >
      <div className={darkMode ? 'dark' : ''}>
        <div className="h-full flex flex-col items-center justify-center max-w-[300px] mx-auto text-primary dark:text-primary-dark">
          {gameState === state.won && (
            <>
              <img src={Success} alt="success" height="auto" width="20%" />
              <h1 className=" text-3xl">Congrats!</h1>
              <div>{GetDefinition(answer)}</div>

              <p className="mt-3 text-2xl">Won: {wins}</p>
              <p className="mt-3 text-2xl">Lost: {losses}</p>
            </>
          )}
          {gameState === state.lost && (
            <>
              <img src={Fail} alt="success" height="auto" width="20%" />
              <div className="text-primary dark:text-primary-dark text-4xl text-center">
                <p>Oops!</p>
                <p className="mt-3 text-2xl">
                  The word was <strong>{answer}</strong>
                </p>
                <div>{GetDefinition(answer)}</div>
                <p className="mt-3 text-2xl">Won: {wins}</p>
                <p className="mt-3 text-2xl">Lost: {losses}</p>
              </div>
            </>
          )}
          {gameState === state.playing && (
            <>
              <img src={WIP} alt="keep playing" height="auto" width="80%" />
              <div className="text-primary dark:text-primary-dark text-4xl text-center">
                <p className="mt-3 text-2xl">Won: {wins}</p>
                <p className="mt-3 text-2xl">Lost: {losses}</p>
              </div>
            </>
          )}
          <ShareButton />
          <CloseButton />
        </div>
      </div>
    </Modal>
  )
}
