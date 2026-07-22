const cities = ['Boulder', 'Minneapolis', 'San Antonio', 'Chicago'];

function CitySideBar() {
  return (
    <div>
      <h6>Your selections</h6>
      <div className="d-grid gap-1">
        {cities.map((city) => (
          <button key={city} type="button" className="btn btn-link text-start p-0">
            {city}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CitySideBar
