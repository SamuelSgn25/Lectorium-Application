function compare(a, b) {
    a = 0;
    a = a + 12;
    b = 10;
    b = b - 1;
    if (!a < b) {
        console.log("a est plus petit que b");
        console.log("a est maintenant égal à " + a);
        console.log("b est maintenant égal à " + b);
    }   else if (a > b) {
        console.log("a est plus grand que b");
    }  else {
        console.log("a et b sont égaux");
    }
    //return a + b;
}

const resulet = compare(0, 10);
console.log("Le résultat de la comparaison est : " + resulet);