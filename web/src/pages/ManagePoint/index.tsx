import React, { useEffect, useState, ChangeEvent, /*FormEvent*/ } from 'react';
import { Link, /*useHistory*/ } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { LeafletMouseEvent } from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
//import Dropzone from '../../components/Dropzone';
import logo from '../../assets/logo.svg';
import api from '../../services/api';
import './styles.css';
//import NumberFormat from 'react-number-format';

/*
import Constants from 'expo-constants';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';
*/

interface Item { id: number; title: string; image_url: string; }
interface Params { uf: string; city: string; }
interface Point { id: number; name: string; image: string; image_url: string; latitude: number; longitude: number; }
interface IBGEUFResponse { sigla: string; }
interface IBGECityResponse { nome: string; }

const ManagePoints = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    //const [points, setPoints] = useState<Point[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    //const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    //const [selectedFile, setSelectedFile] = useState<File>();
    //const history = useHistory();

    //const navigation = useNavigation();
    //const route = useRoute();
    //const routeParams = route.params as Params;

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
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla).sort();
            setUfs(ufInitials);
        });
    }, []);

    useEffect(() => {
        if (selectedUf === '0') { return; }
        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome);
                setCities(cityNames);
            });
    }, [selectedUf]);

    /*
    useEffect(() => {
        api.get('points', {
            params: {
                city: routeParams.city,
                uf: routeParams.uf,
                items: selectedItems
            }
        }).then(response => {
            setPoints(response.data);
        })
    }, [selectedItems]);
*/
    /*
        function handleNavigateBack() {
            history.push('/');
        }
    */
    /*
        function handleNavigateToDetail(id: number) {
            navigation.navigate('Detail', { point_id: id });
        }
    */
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
    /*
        function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
            const { name, value } = event.target;
            setFormData({ ...formData, [name]: value });
        }
    
        async function handleSubmit(event: FormEvent) {
            event.preventDefault();
    
            const { name, email, whatsapp } = formData;
            const uf = selectedUf;
            const city = selectedCity;
            const [latitude, longitude] = selectedPosition;
            const items = selectedItems;
            const data = new FormData();
    
            var flagCampos = true; var queCampo = '';
            //if (flagCampos && !selectedFile) { flagCampos = false; queCampo = 'Imagem'; }
            if (flagCampos && name.length < 3) { flagCampos = false; queCampo = 'Nome'; }
            if (flagCampos && email.length < 3) { flagCampos = false; queCampo = 'Email'; }
            if (flagCampos && whatsapp.length < 10) { flagCampos = false; queCampo = '(DDD)Whatsapp'; }
            if (flagCampos && String(latitude).length < 3) { flagCampos = false; queCampo = 'Posicao'; }
            if (flagCampos && uf.length < 2) { flagCampos = false; queCampo = 'UF'; }
            if (flagCampos && city.length < 2) { flagCampos = false; queCampo = 'Cidade'; }
            if (flagCampos && items.length < 1) { flagCampos = false; queCampo = 'Items'; }
            if (flagCampos) {
                //if (selectedFile) { data.append('image', selectedFile) }
                data.append('name', name);
                data.append('email', email);
                data.append('whatsapp', whatsapp);
                data.append('uf', uf);
                data.append('city', city);
                data.append('latitude', String(latitude));
                data.append('longitude', String(longitude));
                data.append('items', items.join(','));
                await api.post('points', data).catch(function (err) { alert(err.message); })
                alert('Ponto de coleta criado!');
                history.push('/');
            } else alert('Preencha o campo: ' + queCampo);
        }
    */
    return (
        <div id="page-manage-point">
            <header>  <img src={logo} alt="Ecoleta" />  <Link to="/"> <FiArrowLeft />  Voltar para home   </Link>  </header>
            <form>
                <h2> Bem vindo.</h2>
                <span> Encontre no mapa um ponto de coleta.</span>
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
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
};

/*
{points?.map(point => (
    <Marker
        key={String(point.id)}
        style={styles.mapMarker}
        onPress={() => handleNavigateToDetail(point.id)}
        coordinate={{ latitude: point.latitude, longitude: point.longitude }}
    >
        <View style={styles.mapMarkerContainer}>
            <Image style={styles.mapMarkerImage} source={{ uri: point.image_url }} />
            <Text style={styles.mapMarkerTitle} > {point.name} </Text>
        </View>
    </Marker>
))}


<View style={styles.itemsContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }} >
        {items.map(item => (
            <TouchableOpacity
                key={String(item.id)}
                style={[styles.item, selectedItems.includes(item.id) ? styles.selectedItem : {}]}
                onPress={() => handleSelectItem(item.id)}
                activeOpacity={0.6}
            >
                <SvgUri width={42} height={42} uri={item.image_url} />
                <Text style={styles.itemTitle}> {item.title} </Text>
            </TouchableOpacity>
        ))}
    </ScrollView>
</View>
*/

export default ManagePoints;