import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory, /*Router, Route*/ } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import NumberFormat from 'react-number-format';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../../services/api';
import Dropzone from '../../../components/Dropzone';
import logo from '../../../assets/logo.svg';
import './styles.css';
//import Routes from '../../../routes';

// array ou objeto:  informar o tipo da variavel
interface Item { id: number; title: string; image_url: string; }
interface IBGEUFResponse { sigla: string; }
interface IBGECityResponse { nome: string; }
interface Params {point_id: number;}
interface Dados {
  point: {
    id: number;
    image: string;
    image_url: string;
    name: string;
    email: string;
    whatsapp: string;
    city: string;
    uf: string;
    latitude: number;
    longitude: number;
  };
  items: {
    id: number;
    title: string;
  }[];
}

const ManageDetail = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  const [formPerson, setFormPerson] = useState({ name: '', email: '', whatsapp: '' });
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const history = useHistory();
  const [dados, setDados] = useState<Dados>({} as Dados);
  const [newfile, setNewfile] = useState<Boolean>(false);
  
  //const navigation = useNavigation();
  //const route = useRoute();
  //const routeParams = Router.caller.arguments as Params;
  //const { match: { params } } = this.props;

  // useEffect(() => {qual funcao a executar}, [quando executar]) 
  useEffect(() => {   // Points
    //api.get(`points/${params.point_id}`).then(response => {
    api.get(`points/3`).then(response => { setDados(response.data); });
  }, []);

  useEffect(() => {   // Items (originais)
    api.get('items').then(response => { setItems(response.data); });
  }, []);

  useEffect(() => {   // GeoLocation
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {   // UF
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla).sort();
      setUfs(ufInitials);
    });
  }, []);

  useEffect(() => {   // City
    if (selectedUf === '0') { return; }
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response => {
        const cityNames = response.data.map(city => city.nome);
        setCities(cityNames);
      });
  }, [selectedUf]);

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setSelectedUf(uf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormPerson({ ...formPerson, [name]: value });
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);
    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }
  
  function handleImgDblClick() {
    setNewfile(true);
  }
  
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const { name, email, whatsapp } = formPerson;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;
    const fdata = new FormData();
    
    var flagCampos = true; var queCampo = '';
    //if (flagCampos && !selectedFile) { flagCampos = false; queCampo = 'Imagem'; }
    if (flagCampos && name.length < 3) { flagCampos = false; queCampo = 'Nome'; }
    if (flagCampos && email.length < 3) { flagCampos = false; queCampo = 'Email'; }
    if (flagCampos && whatsapp.length < 10) { flagCampos = false; queCampo = '(DDD)Whatsapp'; }
    if (flagCampos && String(latitude).length < 3) { flagCampos = false; queCampo = 'Posicao'; }
    if (flagCampos && uf.length < 2) { flagCampos = false; queCampo = 'UF'; }
    if (flagCampos && city.length < 2) { flagCampos = false; queCampo = 'Cidade'; }
    if (flagCampos && items.length < 1) { flagCampos = false; queCampo = 'Items'; }
    if (!flagCampos) {
      alert('Preencha o campo: ' + queCampo);
      return (false);
    }
    //fdata.append('id', String(dados.point.id));
    fdata.append('image', dados.point.image);
    if (selectedFile) {fdata.set('image', selectedFile);}
    fdata.append('imageToDelete', dados.point.image);
    fdata.append('name', name);
    fdata.append('email', email);
    fdata.append('whatsapp', whatsapp);
    fdata.append('uf', uf);
    fdata.append('city', city);
    fdata.append('latitude', String(latitude));
    fdata.append('longitude', String(longitude));
    fdata.append('items', items.join(','));
    await api.post(`points/${dados.point.id}`, fdata)
      .then(function (res) {
        alert('Ponto de coleta alterado!');
        history.goBack();
      })
      .catch(function (err) { alert(err.message) });
  }

  if (!dados.point) { return null; }
  if (formPerson.name.length === 0) { setFormPerson({ name: dados.point.name, email: dados.point.email, whatsapp: dados.point.whatsapp }) }
  if (selectedPosition[0] === 0) { setSelectedPosition([dados.point.latitude, dados.point.longitude]) };
  if (selectedUf === '0') { setSelectedUf(dados.point.uf) };
  if (selectedCity === '0') { setSelectedCity(dados.point.city) };
  
  if (selectedItems.length === 0) {
    var i: any;
    var dadositems: number[] = new Array(dados.items.length);
    for (i in dados.items) { dadositems[i] = dados.items[i].id; }
    setSelectedItems(dadositems);
  }
  
  return (
    <div id="page-manage-detail">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Detalhes do <br /> ponto de coleta</h1>

        <div className={newfile ? 'setHidden' : 'setVisible'}>
          <img className="imagem" src={dados.point.image_url} alt={dados.point.name} onDoubleClick={handleImgDblClick} title="De duplo-clique para alterar" />
        </div>

        <div className={newfile ? 'setVisible' : 'setHidden'}>
        <Dropzone onFileUploaded={setSelectedFile} />
        </div>

        <fieldset>
          <legend> <h2>Dados</h2> </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name" onChange={handleInputChange} defaultValue={dados.point.name} />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email" name="email" id="email" onChange={handleInputChange} defaultValue={dados.point.email} />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <NumberFormat name="whatsapp" id="whatsapp" format="+55(##)#########" mask="_" onChange={handleInputChange} defaultValue={dados.point.whatsapp} />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => ( <option key={uf} value={uf}> {uf} </option> ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                <option value="0">Selecione uma cidade</option>
                {cities.map(city => ( <option key={city} value={city}> {city} </option> ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
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
        <button type="submit">Alterar ponto de coleta</button>
      </form>
    </div>
  );
};

export default ManageDetail;