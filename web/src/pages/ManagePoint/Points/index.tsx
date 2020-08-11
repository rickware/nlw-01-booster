// TODO Use cookies to store user preferences on start  https://github.com/tylerwolff/useCookie
// TODO Cached queries seems better like https://github.com/tannerlinsley/react-query/blob/master/examples/basic/src/index.js
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft, FiArrowLeftCircle } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../../services/api';
import './styles.css';
import logo from '../../../assets/logo.svg';

// array ou objeto:  informar o tipo da variavel
interface Item { id: number; title: string; image_url: string; }
interface IBGEUFResponse { sigla: string; }
interface IBGECityResponse { nome: string; }
interface Point {
  id: number;
  name: string;
  uf: string;
  city: string;
  email: string;
  image: string;
  image_url: string;
  latitude: number;
  longitude: number;
}
interface Local { id: number; uf: string; city: string;}
let getParams: Local = {id: 0, uf: '', city: ''};
const mapAttrib = '&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
const mapUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const IBGEApiUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';

const ManagePoints = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const history = useHistory();

  useEffect(() => {
    api.get('items').then(response => { setItems(response.data); });
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    axios.get<IBGEUFResponse[]>(IBGEApiUrl).then(response => {
      const ufInitials = response.data.map(uf => uf.sigla).sort();
      setUfs(ufInitials);
    });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') { return; }
    axios
      .get<IBGECityResponse[]>(IBGEApiUrl.concat('/', selectedUf, '/municipios'))
      .then(response => {
        const cityNames = response.data.map(city => city.nome);
        setCities(cityNames);
    }).catch(function (err) { alert(err.message); });
  }, [selectedUf]);
    
  useEffect(() => {
    if (selectedItems.length === 0) {
      setPoints([]);
      return;
    }
    api.get('points', {
    params: {
        uf: getParams.uf,
        city: getParams.city,      
        items: selectedItems.join(',')
      }
    }).then(response => {
      setPoints(response.data);
    }).catch(function (err) { alert(err.message); })
  }, [selectedItems]);

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);
    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }
  
  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const estado = event.target.value;
    getParams.uf = estado;
    setSelectedUf(estado);
  }
  
  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    //  torna visivel os Items
    let shand = document.getElementsByClassName('fitems') as HTMLSelectElement   //NodeListOf<HTMLElement>;
    if (shand.length !== 0) { shand[0].style.visibility = "visible" };
    const cidade = event.target.value;
    getParams.city = cidade;
    setSelectedCity(cidade);
  }

  function handleMapClick(event: LeafletMouseEvent) {
/*     setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ]) */
  }

  function handleNavigateToDetail(id: number) {
    history.push(`/webDetail/${id}`);
  }

  return (
    <div id="page-manage-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form>
        <h1>Pontos de coleta</h1>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
          </legend>

          <div className="field-group">
            <div className="ufCity">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                <option value="0">UF</option>
                {ufs.map(uf => (<option key={uf} value={uf}>{uf}</option>))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                <option value="0">Selecione uma cidade</option>
                {cities.map(city => (<option key={city} value={city}>{city}</option>))}
              </select>
              </div>
            </div>
            <div className="msg2Client"><FiArrowLeftCircle /> Selecione um endereço no mapa</div>
          </div>
            </fieldset>
			<div className="container">
			<div>
          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution={mapAttrib}
              url={mapUrl}
              />
            {
              points.map(point => (
                <Marker
                key={String(point.id)}
                position={{
                  lat: point.latitude,
                  lng: point.longitude
                }}
                onclick={() => handleNavigateToDetail(point.id)}
                riseOnHover
                />
                ))}
          </Map>
			</div>

        <div className="fitems">
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(item => (
              <li
              key={item.id}
              onClick={() => handleSelectItem(item.id)}
              className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
          </div>
          </div>
      </form>
    </div>
  );
};

export default ManagePoints;