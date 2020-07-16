import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory, /*Router, Route, Switch */} from 'react-router-dom';
import { FiArrowLeft, FiArrowRightCircle } from 'react-icons/fi';
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
  image: string;
  image_url: string;
  latitude: number;
  longitude: number;
}

let getParams: Array<string> = ['uf', 'city'];
const mapAttrib = '&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
const mapUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const IBGEApiUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';

const ManagePoints = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  //const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const history = useHistory();

  // useEffect(() => {qual funcao a executar}, [quando executar]) 
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
      });
  }, [selectedUf]);

  useEffect(() => {
    //http://localhost:3333/points?city=Teres%C3%B3polis&uf=RJ&items=4
    if (selectedItems.length===0) { return; }
    api.get('points', {
      params: {
        uf: getParams[0],       
        city: getParams[1],      
        items: selectedItems.join(',')
      }
    }).then(response => {
      setPoints(response.data);
    })
  }, [selectedItems]);

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    getParams[0] = uf;
    setSelectedUf(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    //  torna visivel os Items
    let shand = document.getElementsByName('fitems') as NodeListOf<HTMLElement>;
    if (shand.length !== 0) { shand[0].style.visibility = "visible" };
    let sbutt = document.getElementById('btnSubmit') as HTMLElement;
    sbutt.style.visibility = "visible";
    const city = event.target.value;
    getParams[1] = city;
    setSelectedCity(city);
  }
  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ])
  }
  function handlePointClick(event: LeafletMouseEvent) {
    /*
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ])
    */
  }
  /*
    function handleNavigateToDetail(id: number) {
      navigation.navigate('Detail', { point_id: id });
    }
  */
  /*   function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
      const { name, value } = event.target;
      setFormData({ ...formData, [name]: value });
    } */

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    //const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;
    const queryData = new FormData();

    var flagCampos = true; var queCampo = '';
    //if (flagCampos && String(latitude).length < 3) { flagCampos = false; queCampo = 'Posicao'; }
    if (flagCampos && uf.length < 2) { flagCampos = false; queCampo = 'UF'; }
    if (flagCampos && city.length < 2) { flagCampos = false; queCampo = 'Cidade'; }
    if (flagCampos && items.length < 1) { flagCampos = false; queCampo = 'Items'; }
    if (flagCampos) {
      //if (selectedFile) { data.append('image', selectedFile) }
      queryData.append('uf', uf);
      queryData.append('city', city);
      queryData.append('latitude', String(latitude));
      queryData.append('longitude', String(longitude));
      queryData.append('items', items.join(','));
      /*
      await api.post('points', data).catch(function (err) { alert(err.message); })
      alert('Ponto de coleta criado!');
      */
      history.push('/');

    } else alert('Preencha o campo: ' + queCampo);
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

      <form onSubmit={handleSubmit}>
        <h1>Pontos de coleta</h1>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione um endereço no mapa</span>
          </legend>

          <div className="field-group">
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

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution={mapAttrib}
              url={mapUrl}
            />
            {points.map(point => (
              <Marker
                key={String(point.id)}
                position={{
                  lat: point.latitude,
                  lng: point.longitude
                }}
                onclick={handlePointClick}
              />
            ))}
          </Map>

        </fieldset>

        <fieldset name="fitems">
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
        </fieldset>
        <Link to="/webDetail">
          <FiArrowRightCircle />
          Ver Detalhe
        </Link>

        <button id="btnSubmit" type="submit">Ver ponto de coleta</button>
      </form>
    </div>
  );
};

export default ManagePoints;