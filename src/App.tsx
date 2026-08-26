import { AnimatePresence, motion } from 'motion/react'
import { Stage } from './fx/Stage'
import { NameInput } from './screens/NameInput'
import { GiftPick } from './screens/GiftPick'
import { useGame } from './game/store'

export default function App() {
  const screen = useGame((s) => s.screen)
  const enterGame = useGame((s) => s.enterGame)

  return (
    <Stage>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          className="h-full w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {screen === 'nameInput' && <NameInput onDone={enterGame} />}
          {screen === 'giftPick' && <GiftPick />}
        </motion.div>
      </AnimatePresence>
    </Stage>
  )
}
