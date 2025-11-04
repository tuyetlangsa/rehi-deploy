export type SubscriptionPlan = {
    id: string;
    name: string;
    price: number;
    description: string;
    status: SubscriptionStatus;
    currentPeriodEnd: Date;
}
export enum SubscriptionStatus {
    Pending,
    Active,
    Expired,
    Cancelled,
    Suspended
}
