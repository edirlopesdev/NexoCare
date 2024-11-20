import React, { useState } from 'react';
import { signUp } from './auth';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    const user = await signUp(email, password);
    if (user) {
      console.log('Usuário cadastrado com sucesso:', user);
    }
  };

  return (
    <div>
      <h2>Cadastro</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignUp}>Cadastrar</button>
    </div>
  );
};

export default SignUpForm;