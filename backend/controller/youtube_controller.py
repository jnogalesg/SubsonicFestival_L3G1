import os
import time
from typing import Any

import requests
from fastapi import APIRouter, HTTPException, Query
from model.factory.factory_dao import DAOFactory

router = APIRouter(prefix="/api/youtube", tags=["YouTube"])

# Cache simple para no gastar cuota de YouTube en cada recarga.
_CACHE_TTL_SECONDS = 600
_cache: dict[str, dict[str, Any]] = {}

ARTISTAS_FESTIVAL = [
    {"id": 1, "nombre": "Tiesto", "tags": ["House", "Mainstage"]},
    {"id": 2, "nombre": "David Guetta", "tags": ["Big Room", "Dance"]},
    {"id": 3, "nombre": "Martin Garrix", "tags": ["Progressive", "Electro"]},
    {"id": 4, "nombre": "Armin van Buuren", "tags": ["Trance", "Techno"]},
    {"id": 5, "nombre": "Charlotte de Witte", "tags": ["Techno", "Peak Time"]},
]


@router.get("/festival-music", summary="Obtener artistas y playlist desde YouTube")
def obtener_musica_festival(
    artista: str | None = Query(default=None, description="Nombre de artista para busqueda puntual"),
    limite: int = Query(default=5, ge=1, le=10, description="Numero maximo de videos por artista"),
    max_artistas: int = Query(default=5, ge=1, le=12, description="Numero maximo de artistas del festival a consultar"),
):
    api_key = os.getenv("YOUTUBE_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Falta configurar YOUTUBE_API_KEY en el backend.",
        )

    artista_limpio = (artista or "").strip()

    if artista_limpio:
        cache_key = f"artista:{artista_limpio.lower()}|limite:{limite}"
    else:
        artistas_base = _obtener_artistas_desde_festivales()

        # Si cambia la configuracion de artistas en festivales, cambia la clave de cache.
        firma_artistas = "|".join(a["nombre"].strip().lower() for a in artistas_base)
        cache_key = f"festival|limite:{limite}|max:{max_artistas}|firma:{firma_artistas}"

    ahora = time.time()
    cache_item = _cache.get(cache_key)
    if cache_item and cache_item.get("data") and (ahora - float(cache_item.get("timestamp", 0.0))) < _CACHE_TTL_SECONDS:
        return cache_item["data"]

    if artista_limpio:
        playlist = _buscar_videos_artista(artista_limpio, api_key, max_results=limite)
        if not playlist:
            return []

        artista_unico = [
            {
                "id": 1,
                "nombre": artista_limpio,
                "img": playlist[0]["thumbnail"],
                "tags": ["Busqueda", "YouTube"],
                "playlist": [
                    {
                        "num": f"{indice:02d}",
                        "titulo": video["titulo"],
                        "videoId": video["videoId"],
                        "url": f"https://www.youtube.com/watch?v={video['videoId']}",
                    }
                    for indice, video in enumerate(playlist, start=1)
                ],
            }
        ]

        _cache[cache_key] = {"timestamp": ahora, "data": artista_unico}
        return artista_unico

    if not artistas_base:
        _cache[cache_key] = {"timestamp": ahora, "data": []}
        return []

    artistas_con_playlist = []
    for artista_item in artistas_base[:max_artistas]:
        playlist = _buscar_videos_artista(artista_item["nombre"], api_key, max_results=limite)
        if not playlist:
            continue

        artistas_con_playlist.append(
            {
                "id": artista_item["id"],
                "nombre": artista_item["nombre"],
                "img": playlist[0]["thumbnail"],
                "tags": artista_item["tags"],
                "playlist": [
                    {
                        "num": f"{indice:02d}",
                        "titulo": video["titulo"],
                        "videoId": video["videoId"],
                        "url": f"https://www.youtube.com/watch?v={video['videoId']}",
                    }
                    for indice, video in enumerate(playlist, start=1)
                ],
            }
        )

    _cache[cache_key] = {"timestamp": ahora, "data": artistas_con_playlist}
    return artistas_con_playlist


def _obtener_artistas_desde_festivales() -> list[dict[str, Any]]:
    dao = DAOFactory.get_festival_dao()
    festivales = dao.obtener_todos()

    artistas: list[dict[str, Any]] = []
    vistos: set[str] = set()
    idx = 1

    for festival in festivales:
        horarios = getattr(festival, "horarios", []) or []
        for escenario in horarios:
            acts = escenario.get("acts", []) if isinstance(escenario, dict) else []
            for act in acts:
                if not isinstance(act, dict):
                    continue

                nombre_artista = (
                    act.get("artist")
                    or act.get("artista")
                    or act.get("nombre")
                    or ""
                ).strip()
                clave = nombre_artista.lower()
                if not nombre_artista or clave in vistos:
                    continue

                vistos.add(clave)
                artistas.append(
                    {
                        "id": idx,
                        "nombre": nombre_artista,
                        "tags": ["Festival", "Live"],
                    }
                )
                idx += 1

    return artistas


def _buscar_videos_artista(nombre_artista: str, api_key: str, max_results: int = 5) -> list[dict]:
    consulta = f"{nombre_artista} live set official"
    respuesta = requests.get(
        "https://www.googleapis.com/youtube/v3/search",
        params={
            "part": "snippet",
            "type": "video",
            "videoEmbeddable": "true",
            "safeSearch": "moderate",
            "order": "relevance",
            "maxResults": max_results,
            "q": consulta,
            "key": api_key,
        },
        timeout=10,
    )

    if respuesta.status_code != 200:
        detalle_google = ""
        try:
            payload_error = respuesta.json()
            detalle_google = payload_error.get("error", {}).get("message", "")
        except Exception:
            detalle_google = ""

        if detalle_google:
            detalle = f"YouTube API error ({respuesta.status_code}): {detalle_google}"
        else:
            detalle = f"No se pudo consultar YouTube API (status {respuesta.status_code}). Revisa clave, restricciones y cuota."

        raise HTTPException(
            status_code=502,
            detail=detalle,
        )

    data = respuesta.json()
    items = data.get("items", [])

    resultado = []
    for item in items:
        video_id = item.get("id", {}).get("videoId")
        snippet = item.get("snippet", {})
        thumbnail = (
            snippet.get("thumbnails", {}).get("high", {}).get("url")
            or snippet.get("thumbnails", {}).get("medium", {}).get("url")
            or snippet.get("thumbnails", {}).get("default", {}).get("url")
            or ""
        )
        titulo = snippet.get("title", "Video")

        if video_id and thumbnail:
            resultado.append(
                {
                    "videoId": video_id,
                    "titulo": titulo,
                    "thumbnail": thumbnail,
                }
            )

    return resultado
