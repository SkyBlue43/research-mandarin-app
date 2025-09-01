'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await fetch("http://localhost:8000/check-password", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      const data = await result.json();
      if (data.test === "pre"){
        router.push(`test?test=${data.test}`)
      }
      else if (data.test === "post"){
        router.push(`test?test=${data.test}`)
      }
      else {
        router.push(`/practice_session?test=${data.test}&group=${data.group}&name=${data.name}`)
      }
    }

    catch (error: any) {
      console.error('Login error:', error.message);
      alert(error.message);
    }
  }

  return (
    <div className='flex justify-center items-center text-center min-h-screen'>
      <form onSubmit={handleSubmit}>
        <div>
          <input className='text-white p-2 border-blue-500 border-2 m-4 focus:ring-gray-500 focus:border-gray-500'
            placeholder='Username'
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}>
          </input>
        </div>

        <div>
          <input className='text-white p-2 border-blue-500 border-2 m-4 focus:ring-gray-500 focus:border-gray-500'
            placeholder='Password'
            type='text'
            value={password}
            onChange={(e) => setPassword(e.target.value)}>
          </input>
        </div>

        <button className='m-2 p-2 bg-blue-500 text-lg text-black rounded hover:bg-gray-500'
          type='submit'>
          Submit
        </button>
      </form>
    </div>
  );
}
