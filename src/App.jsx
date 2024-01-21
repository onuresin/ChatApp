import { useEffect, useRef, useState } from 'react';
import './App.css'
import Send from './assets/send-button.svg'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://wzrikutmatgsckystinz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cmlrdXRtYXRnc2NreXN0aW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ4MTA5MjgsImV4cCI6MjAyMDM4NjkyOH0.DZB22q6nUAIZ1wU_dM461j0GwykyYJgD7XBfStF643A')

export default function App() {
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);
  const msgInput = useRef(null);

  useEffect( () => {

    async function fetchData(){
      let { data: chats, error } = await supabase
      .from('chats')
      .select('*')

      setMessages(chats);

   }
    fetchData();   
    
    

    const channels = supabase.channel('chat-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chats' },
      (payload) => {
        setMessages(prev => {
          return [...prev,payload.new]
        });
      }
    )
    .subscribe()
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    

    const formData = new FormData(e.target);
    const formObj = Object.fromEntries(formData);

    const { data, error } = await supabase
    .from('chats')
    .insert([formObj])
    .select() 

    msgInput.current.value = '';

  }
  return (
    <>
      <div className="container">
        <div className="inner">
          <div className="title">
            <h3>Konuşma Kanalı</h3>
          </div>
          <ul className="chatBox">
            {
              messages.map(x => <li key={x.id} className={x.name === name? 'currentUser': ''} style={{ color: x.color }}><strong>{x.name}</strong>- {x.msg}</li>)
            }
            <li className='anchor'></li>
          </ul>
          <form className='form-section' autoComplete='off' onSubmit={handleSubmit}>
              <input type="text" onChange={(e) => { setName(e.target.value) }} value={name} name='name' placeholder='Nick'/>
              <input type="color" name='color'/>
              <input type="text" ref={msgInput} name='msg' placeholder='Mesajınızı giriniz'/>
              <button className='send-btn'><img src={Send}/></button>
          </form>
        </div>
      </div>
    </>
  )
}