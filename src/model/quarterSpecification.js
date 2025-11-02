// Input is expected to be a URLSearchParams instance
export function parseParameters(params) {
    // We zero-index months internally because JS does but we don't expose that in the
    // API since it's weird
    const yearStartMonth = parseInt(params.get('yearStartMonth') || '1') - 1;
    return new QuarterSpecification(yearStartMonth)
}

export class QuarterSpecification {
    static default() {
        return new QuarterSpecification(0);
    }

    constructor(yearStartMonth) {
        this.yearStartMonth = yearStartMonth;
    }
}
