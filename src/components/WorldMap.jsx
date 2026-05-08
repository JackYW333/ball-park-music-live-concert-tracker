import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const base = import.meta.env.BASE_URL ?? '/'
const GEO_URL = `${base}data/countries-110m.json`.replace('//', '/')

// ISO 3166-1 numeric → alpha-2
const ISO_NUM_TO_A2 = {
  4:'AF',8:'AL',12:'DZ',20:'AD',24:'AO',28:'AG',32:'AR',36:'AU',40:'AT',
  44:'BS',48:'BH',50:'BD',52:'BB',56:'BE',64:'BT',68:'BO',70:'BA',
  72:'BW',76:'BR',84:'BZ',90:'SB',96:'BN',100:'BG',104:'MM',108:'BI',
  112:'BY',116:'KH',120:'CM',124:'CA',132:'CV',140:'CF',144:'LK',148:'TD',
  152:'CL',156:'CN',170:'CO',174:'KM',178:'CG',180:'CD',188:'CR',191:'HR',
  192:'CU',196:'CY',203:'CZ',204:'BJ',208:'DK',214:'DO',218:'EC',231:'ET',
  232:'ER',233:'EE',242:'FJ',246:'FI',250:'FR',262:'DJ',266:'GA',268:'GE',
  276:'DE',288:'GH',300:'GR',308:'GD',320:'GT',324:'GN',328:'GY',
  332:'HT',340:'HN',344:'HK',348:'HU',352:'IS',356:'IN',360:'ID',
  364:'IR',368:'IQ',372:'IE',376:'IL',380:'IT',388:'JM',392:'JP',
  398:'KZ',400:'JO',404:'KE',408:'KP',410:'KR',414:'KW',417:'KG',
  418:'LA',422:'LB',426:'LS',428:'LV',430:'LR',434:'LY',440:'LT',442:'LU',
  450:'MG',454:'MW',458:'MY',462:'MV',466:'ML',470:'MT',478:'MR',480:'MU',
  484:'MX',496:'MN',498:'MD',499:'ME',504:'MA',508:'MZ',516:'NA',524:'NP',
  528:'NL',548:'VU',554:'NZ',558:'NI',562:'NE',566:'NG',578:'NO',
  586:'PK',598:'PG',600:'PY',604:'PE',608:'PH',616:'PL',620:'PT',
  626:'TL',634:'QA',642:'RO',643:'RU',646:'RW',682:'SA',686:'SN',
  688:'RS',694:'SL',702:'SG',703:'SK',704:'VN',705:'SI',706:'SO',
  710:'ZA',716:'ZW',724:'ES',728:'SS',736:'SD',740:'SR',748:'SZ',
  752:'SE',756:'CH',760:'SY',762:'TJ',764:'TH',768:'TG',776:'TO',
  780:'TT',784:'AE',788:'TN',792:'TR',795:'TM',800:'UG',804:'UA',
  807:'MK',818:'EG',826:'GB',834:'TZ',840:'US',854:'BF',858:'UY',
  860:'UZ',862:'VE',882:'WS',887:'YE',894:'ZM',
  31:'AZ',51:'AM',158:'TW',
}

export default function WorldMap({ countries }) {
  const navigate = useNavigate()
  const [tooltip, setTooltip] = useState(null)

  const countMap = new Map(countries.map(c => [c.code, c]))
  const max = countries[0]?.count || 1

  return (
    <div className="card">
      <div className="card-title">Shows by Country</div>
      <div style={{ position: 'relative' }}>
        <ComposableMap
          projectionConfig={{ scale: 147, center: [0, 10] }}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const alpha2 = ISO_NUM_TO_A2[Number(geo.id)]
                const d = alpha2 ? countMap.get(alpha2) : null
                const opacity = d ? (0.25 + (d.count / max) * 0.75).toFixed(2) : 0
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={d ? `rgba(79,142,247,${opacity})` : '#1e1e2a'}
                    stroke="#0c0c10"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: d ? '#4f8ef7' : '#262636', cursor: d ? 'pointer' : 'default' },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={() => d && setTooltip(d)}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => d && navigate(`/country/${d.code}`)}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>
        {tooltip && (
          <div style={{
            position: 'absolute', bottom: '0.75rem', left: '0.75rem',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 7, padding: '0.35rem 0.65rem', fontSize: '0.8rem',
            pointerEvents: 'none', color: 'var(--text)',
          }}>
            <strong>{tooltip.name}</strong> · {tooltip.count} show{tooltip.count !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
