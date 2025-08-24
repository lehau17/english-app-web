import './App.css'
import Button from './components/Button'

function App() {
  return (
    <>
      <h1>My App</h1>
      <p>
        Please add a sound file named 'click.mp3' to the 'src/assets/sounds'
        directory.
      </p>
      <Button onClick={() => console.log('Button clicked!')}>Click me!</Button>
    </>
  )
}

export default App
