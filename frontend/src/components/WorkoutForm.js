import { useState } from "react"
import { useWorkoutsContext } from "../hooks/useWorkoutsContext"
import { useAuthContext } from '../hooks/useAuthContext'

const WorkoutForm = () => {
  const { dispatch } = useWorkoutsContext()
  const { user } = useAuthContext()

  const [title, setTitle] = useState('')
  const [load, setLoad] = useState('')
  const [reps, setReps] = useState('')
  const [error, setError] = useState(null)
  const [emptyFields, setEmptyFields] = useState([])
  const [passwordLength, setPasswordLength] = useState('')
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true)

  const generatePassword = () => {
    const charset = []
    if (includeUppercase) charset.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    if (includeLowercase) charset.push('abcdefghijklmnopqrstuvwxyz')
    if (includeNumbers) charset.push('0123456789')
    if (includeSpecialChars) charset.push('!@#$%^&*()_+')

    const randomChar = (charSet) => charSet[Math.floor(Math.random() * charSet.length)]
    let password = ''
    for (let i = 0; i < passwordLength; i++) {
      password += randomChar(charset[Math.floor(Math.random() * charset.length)])
    }
    return password
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      setError('You must be logged in')
      return
    }

    if (!load) {
      setError('Please enter a URL')
      return
    }

    if (!reps && (!passwordLength || passwordLength < 4 || passwordLength > 50)) {
      setError('Please enter a valid password length (4-50) or generate a password')
      return
    }

    const workout = { title, load, reps: reps || generatePassword() }

    const response = await fetch('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(workout),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      }
    })
    const json = await response.json()

    if (!response.ok) {
      setError(json.error)
      setEmptyFields(json.emptyFields)
    }
    if (response.ok) {
      setTitle('')
      setLoad('')
      setReps('')
      setError(null)
      setEmptyFields([])
      setPasswordLength('')
      setIncludeUppercase(false)
      setIncludeLowercase(false)
      setIncludeNumbers(false)
      setIncludeSpecialChars(false)
      dispatch({ type: 'CREATE_WORKOUT', payload: json })
    }
  }

  return (
    <form className="create" onSubmit={handleSubmit}>
      <h3>Add a Site and Password</h3>

      <label>Title:</label>
      <input
        type="text"
        onChange={(e) => setTitle(e.target.value)}
        value={title}
        className={emptyFields.includes('title') ? 'error' : ''}
      />

      <label>URL:</label>
      <input
        type="text"
        onChange={(e) => setLoad(e.target.value)}
        value={load}
        className={emptyFields.includes('load') ? 'error' : ''}
      />

      <label>Password:</label>
      <input 
        type="text"
        onChange={(e) => setReps(e.target.value)}
        value={reps}
        className={emptyFields.includes('reps') ? 'error' : ''}
      />

      <label>Password Length (4-50):</label>
      <input
        type="number"
        min={4}
        max={50}
        value={passwordLength}
        onChange={(e) => setPasswordLength(e.target.value)}
      />
      
      <div>
        <input
          type="checkbox"
          checked={includeUppercase}
          onChange={(e) => setIncludeUppercase(e.target.checked)}
        />
        <label>Include Uppercase</label>
        <br />
        <input
          type="checkbox"
          checked={includeLowercase}
          onChange={(e) => setIncludeLowercase(e.target.checked)}
        />
        <label>Include Lowercase</label>
        <br />
        <input
          type="checkbox"
          checked={includeNumbers}
          onChange={(e) => setIncludeNumbers(e.target.checked)}
        />
        <label>Include Numbers</label>
        <br />
        <input
          type="checkbox"
          checked={includeSpecialChars}
          onChange={(e) => setIncludeSpecialChars(e.target.checked)}
        />
        <label>Include Special Characters</label>
      </div>

      <button>Add Details</button>
      {error && <div className="error">{error}</div>}
    </form>
  )
}

export default WorkoutForm
