import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

RADIO_BROWSER_HOSTS = [
    "https://de1.api.radio-browser.info",
    "https://at1.api.radio-browser.info",
    "https://nl1.api.radio-browser.info",
]

HEADERS = {
    "User-Agent": "GlobalRadioApp/1.0",
    "Content-Type": "application/json",
}


def radio_get(path, params=None):
    for host in RADIO_BROWSER_HOSTS:
        try:
            resp = requests.get(
                f"{host}/json/{path}",
                params=params,
                headers=HEADERS,
                timeout=8,
            )
            if resp.ok:
                return resp.json()
        except requests.RequestException:
            continue
    return None


def format_station(s):
    return {
        "id": s.get("stationuuid", ""),
        "name": s.get("name", ""),
        "url": s.get("url_resolved") or s.get("url", ""),
        "favicon": s.get("favicon", ""),
        "country": s.get("country", ""),
        "countrycode": s.get("countrycode", ""),
        "language": s.get("language", ""),
        "tags": s.get("tags", ""),
        "bitrate": s.get("bitrate", 0),
        "votes": s.get("votes", 0),
        "codec": s.get("codec", ""),
        "homepage": s.get("homepage", ""),
    }


@app.route("/api/stations/top", methods=["GET"])
def top_stations():
    limit = request.args.get("limit", 60, type=int)
    data = radio_get("stations/topvote", {"limit": limit, "hidebroken": "true"})
    if data is None:
        return jsonify({"error": "Failed to fetch stations"}), 502
    return jsonify([format_station(s) for s in data])


@app.route("/api/stations/search", methods=["GET"])
def search_stations():
    params = {
        "hidebroken": "true",
        "limit": request.args.get("limit", 60, type=int),
        "offset": request.args.get("offset", 0, type=int),
        "order": "votes",
        "reverse": "true",
    }
    name = request.args.get("name")
    country = request.args.get("country")
    language = request.args.get("language")
    tag = request.args.get("tag")

    if name:
        params["name"] = name
    if country:
        params["country"] = country
    if language:
        params["language"] = language
    if tag:
        params["tag"] = tag

    data = radio_get("stations/search", params)
    if data is None:
        return jsonify({"error": "Failed to fetch stations"}), 502
    return jsonify([format_station(s) for s in data])


@app.route("/api/stations/by-language/<language>", methods=["GET"])
def stations_by_language(language):
    limit = request.args.get("limit", 40, type=int)
    data = radio_get(
        f"stations/bylanguage/{language}",
        {"hidebroken": "true", "limit": limit, "order": "votes", "reverse": "true"},
    )
    if data is None:
        return jsonify({"error": "Failed to fetch stations"}), 502
    return jsonify([format_station(s) for s in data])


@app.route("/api/stations/by-country/<countrycode>", methods=["GET"])
def stations_by_country(countrycode):
    limit = request.args.get("limit", 40, type=int)
    data = radio_get(
        f"stations/bycountrycodeexact/{countrycode.upper()}",
        {"hidebroken": "true", "limit": limit, "order": "votes", "reverse": "true"},
    )
    if data is None:
        return jsonify({"error": "Failed to fetch stations"}), 502
    return jsonify([format_station(s) for s in data])


@app.route("/api/stations/by-tag/<tag>", methods=["GET"])
def stations_by_tag(tag):
    limit = request.args.get("limit", 40, type=int)
    data = radio_get(
        f"stations/bytag/{tag}",
        {"hidebroken": "true", "limit": limit, "order": "votes", "reverse": "true"},
    )
    if data is None:
        return jsonify({"error": "Failed to fetch stations"}), 502
    return jsonify([format_station(s) for s in data])


@app.route("/api/countries", methods=["GET"])
def list_countries():
    data = radio_get("countries", {"order": "name", "hidebroken": "true"})
    if data is None:
        return jsonify({"error": "Failed to fetch countries"}), 502
    return jsonify([
        {"name": c.get("name", ""), "stationcount": c.get("stationcount", 0)}
        for c in data
        if c.get("name") and c.get("stationcount", 0) > 5
    ])


@app.route("/api/languages", methods=["GET"])
def list_languages():
    data = radio_get("languages", {"order": "stationcount", "reverse": "true", "hidebroken": "true"})
    if data is None:
        return jsonify({"error": "Failed to fetch languages"}), 502
    return jsonify([
        {"name": l.get("name", ""), "stationcount": l.get("stationcount", 0)}
        for l in data
        if l.get("name") and l.get("stationcount", 0) > 5
    ][:60])


@app.route("/api/tags", methods=["GET"])
def list_tags():
    data = radio_get("tags", {"order": "stationcount", "reverse": "true", "hidebroken": "true"})
    if data is None:
        return jsonify({"error": "Failed to fetch tags"}), 502
    return jsonify([
        {"name": t.get("name", ""), "stationcount": t.get("stationcount", 0)}
        for t in data
        if t.get("name") and len(t.get("name", "")) <= 30 and t.get("stationcount", 0) > 10
    ][:60])


@app.route("/api/station/click/<station_uuid>", methods=["POST"])
def station_click(station_uuid):
    radio_get(f"url/{station_uuid}")
    return jsonify({"ok": True})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(debug=True, port=port)
