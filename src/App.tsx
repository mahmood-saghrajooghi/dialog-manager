import { useDialog } from './dialog-manager/use-dialog'
import * as Dialog from '@radix-ui/react-dialog'

const MyDialog = () => {
  return (
    <Dialog.Root>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Dialog Title</Dialog.Title>
          <Dialog.Description>Dialog Description</Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function App() {
  const { open } = useDialog(MyDialog);

  return (
    <div>
      <button onClick={open}>
        Open Dialog
      </button>
    </div>
  )
}

export default App
