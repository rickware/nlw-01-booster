import React from 'react';
import { FiLogIn } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './styles.css';
import logo from '../../assets/logo.svg';
import bann from '../../assets/home-background.svg';

const Home = () => {
  return (
    <div id="page-home">
      <div id="bg"></div>
      <div className="content">
        <header>
          <img src={logo} alt="Ecoleta" />
        </header>

        <main>
          <h1>Seu marketplace de coleta de resíduos.</h1>
          <p>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</p>

          <Link to="/manage-point">
            <span>
              <FiLogIn />
            </span>
            <strong>Pontos de coleta</strong>
          </Link>

          <Link to="/create-point">
            <span>
              <FiLogIn />
            </span>
            <strong>Cadastre um ponto de coleta</strong>
          </Link>

          <div>
            <img id="imgbanner" src={bann} alt="" />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Home;