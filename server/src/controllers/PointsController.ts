import { Request, Response } from 'express';
import knex from '../database/connection';
import serverIP from './getServerIP';
import fs from 'fs';

class PointsController {
  // index show create update delete
  
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;
    const parsedItems = String(items).split(',').map(item => Number(item.trim()));
    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');
    const serializedPoints = points.map((point: { image: any; }) => { return { ...point, image_url: `http://${serverIP}:3333/uploads/${point.image}` };});
    return response.json(serializedPoints);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;
    const point = await knex('points').where('id', id).first();
    if (!point) { return response.status(400).json({ message: 'Point not found.' }); }
    const serializedPoint = { ...point, image_url: `http://${serverIP}:3333/uploads/${point.image}` };
    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.id', 'items.title');
    return response.json({ point: serializedPoint, items });
  }

  async remove(request: Request, response: Response) {
    const trx = await knex.transaction();
    const { id } = request.params;
    await trx('points')
      .where('id', id)
      .del()
      .catch(function (err: { message: any; }) {
        return response.status(400).json({ message: err.message });
      });
    return response.json({ message: 'Point erased' });
  }

  async create(request: Request, response: Response) {
    const { name, email, whatsapp, latitude, longitude, city, uf, items } = request.body;
    const trx = await knex.transaction();
    const point = { image: request.file.filename,name,email,whatsapp,latitude,longitude,city,uf };
    const insertedIds = await trx('points').insert(point);
    const point_id = insertedIds[0];
    const pointItems = items.split(',').map((item: string) => Number(item.trim())).map((item_id: number) => { return {item_id,point_id}; })
    await trx('point_items').insert(pointItems);
    await trx.commit();
    return response.json({ id: point_id, ...point });
  }  
  
  async update(request: Request, response: Response) {
    const trx = await knex.transaction();
    const { id } = request.params;

    // remove old record to clean databases points & point_ids.
    trx('points')
      .where('id', id)
      .del()
      .catch(function (err: { message: any; }) {
        return response.status(400).json({ message: err.message });
      });
    trx('point_items')
      .where('point_id', id)
      .del()
      .catch(function (err: { message: any; }) {
        return response.status(400).json({ message: err.message });
      });
     
    if (request.file) {
      //todo #5
      const { imageOriginal, name, email, whatsapp, latitude, longitude, city, uf, items } = request.body;
      const point = { image: request.file.filename, name, email, whatsapp, latitude, longitude, city, uf };
      const insertedIds = await trx('points').insert(point);
      const point_id = insertedIds[0];
      const pointItems = items.split(',').map((item: string) => Number(item.trim())).map((item_id: number) => { return { item_id, point_id }; })
      await trx('point_items').insert(pointItems);
      await trx.commit();
      console.log(imageOriginal);
      fs.unlink(`../../uploads/${imageOriginal}`, (err) => {        if (err) throw err;      });
      return response.json({ id: point_id, ...point });
    } else {
      const { imageOriginal, name, email, whatsapp, latitude, longitude, city, uf, items } = request.body;
      const image = imageOriginal;
      const point = { image, name, email, whatsapp, latitude, longitude, city, uf };
      const insertedIds = await trx('points').insert(point);
      const point_id = insertedIds[0];
      const pointItems = items.split(',').map((item: string) => Number(item.trim())).map((item_id: number) => { return { item_id, point_id }; })
      await trx('point_items').insert(pointItems);
      await trx.commit();
      return response.json({ id: point_id, ...point });
    }
  }  
}

export default PointsController;