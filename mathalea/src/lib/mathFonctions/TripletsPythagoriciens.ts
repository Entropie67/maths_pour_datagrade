export default class TripletPythagoricien {
  static getTriplets(max: number, nombre?: number): [number, number, number][] {
    const listeTripletsPythagoriciens = [
      [3, 4, 5],
      [5, 12, 13],
      [6, 8, 10],
      [7, 24, 25],
      [8, 15, 17],
      [9, 12, 15],
      [9, 40, 41],
      [10, 24, 26],
      [12, 16, 20],
      [12, 35, 37],
      [14, 48, 50],
      [15, 20, 25],
      [15, 36, 39],
      [16, 30, 34],
      [18, 24, 30],
      [20, 21, 29],
      [21, 28, 35],
      [24, 32, 40],
      [27, 36, 45],
      [28, 45, 53],
      [30, 40, 50],
      [33, 44, 55],
      [36, 48, 60],
      [39, 52, 65],
      [40, 42, 58],
      [48, 55, 73],
      [65, 72, 97],
    ].filter(([a, b, c]) => Math.max(a, b, c) <= max) as [
      number,
      number,
      number,
    ][]
    nombre = Math.min(
      nombre ?? listeTripletsPythagoriciens.length,
      listeTripletsPythagoriciens.length,
    )
    const triplets = new Set<[number, number, number]>()
    while (triplets.size < nombre) {
      triplets.add(
        listeTripletsPythagoriciens[
          Math.floor(Math.random() * listeTripletsPythagoriciens.length)
        ],
      )
    }
    return Array.from(triplets)
  }
}
