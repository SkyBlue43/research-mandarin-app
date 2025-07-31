'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
 
export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const handleLogin = (username: string, password: string) => {
    console.log(password, username);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(username, password);
  }

  return (
    <div className='flex justify-center items-center text-center min-h-screen'>
      <form onSubmit={handleSubmit}>
        <div>
          <input className='text-white p-2 border-green-500 border-2 m-4 focus:ring-pink-500 focus:border-pink-500'
          placeholder='Username'
          type='text'
          value={username}
          onChange={(e) => setUsername(e.target.value)}>
          </input>
        </div>

        <div>
          <input className='text-white p-2 border-green-500 border-2 m-4 focus:ring-pink-500 focus:border-pink-500'
          placeholder='Password'
          type='text'
          value={password}
          onChange={(e) => setPassword(e.target.value)}>
          </input>
        </div>

        <button className='m-2 p-2 bg-green-500 text-lg text-black rounded hover:bg-pink-500'
          type='submit'>
          Submit
        </button>
      </form>
    </div>
  );
}
