import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserAvatarProps = {
  name?: string;
  picture?: string;
  size: number;
};

export function UserAvatar({ name, picture, size }: UserAvatarProps) {
  return (
    <Avatar style={{ width: size, height: size }}>
      <AvatarImage src={picture} alt={name || "User avatar"} />
      <AvatarFallback className="bg-gray-700 text-xs text-white">
        {name?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
