interface IBootcamp {
    _id: string
    name: string
    slug: string
    description: string
    website: string
    phone: string
    email: string
    address: string
    location: ILocation
    careers: string[]
    averageRating: number | null
    averageCost: number
    housing: boolean | null
    jobAssistance: boolean | null
    jobGuarantee: boolean | null
    acceptGi: boolean | null
    user: string
}

interface ILocation{
    type: string
    coordinates: number[]
    formattedAddress: string
    street: string
    city: string
    state: string
    zipcode: string
    country: string
}

export {IBootcamp}