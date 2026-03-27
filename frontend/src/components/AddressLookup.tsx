import { useState, useEffect, useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress, Typography, Box, debounce } from '@mui/material';
import { LocationOn } from '@mui/icons-material';

interface AddressLookupProps {
  onAddressSelect: (address: {
    addressLine1: string;
    city: string;
    zipCode: string;
  }) => void;
}

export default function AddressLookup({ onAddressSelect }: AddressLookupProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAddresses = useMemo(
    () =>
      debounce(async (query: string, callback: (results: any[]) => void) => {
        if (!query || query.length < 3) {
          callback([]);
          return;
        }

        try {
          setLoading(true);
          // Nominatim usage policy: Limit usage and provide descriptive user-agent
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              query
            )}&format=json&addressdetails=1&countrycodes=gb&limit=5`,
            {
              headers: {
                'User-Agent': 'BookingApp/1.0 (Location Management System)',
              },
            }
          );
          const data = await response.json();
          callback(data);
        } catch (error) {
          console.error('Address lookup failed:', error);
          callback([]);
        } finally {
          setLoading(false);
        }
      }, 800),
    []
  );

  useEffect(() => {
    fetchAddresses(inputValue, (results) => {
      setOptions(results);
    });
  }, [inputValue, fetchAddresses]);

  return (
    <Autocomplete
      id="address-lookup"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      options={options}
      loading={loading}
      getOptionLabel={(option) => option.display_name || ''}
      filterOptions={(x) => x} // Disable internal filtering, use API results
      onChange={(_, value) => {
        if (value && value.address) {
          const addr = value.address;
          // Construct Line 1: House Number + Road or just the main identifier
          const line1 = [addr.house_number || addr.house_name, addr.road || addr.pedestrian]
            .filter(Boolean)
            .join(' ') || value.display_name.split(',')[0];
          
          // City/Town/Village
          const city = addr.city || addr.town || addr.village || addr.suburb || '';
          
          onAddressSelect({
            addressLine1: line1,
            city: city,
            zipCode: addr.postcode || '',
          });
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Address (Auto-complete)"
          placeholder="Start typing/pasting address..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ display: 'flex', gap: 2, py: 1 }}>
          <LocationOn color="primary" sx={{ mt: 0.5 }} fontSize="small" />
          <Box>
            <Typography variant="body2" fontWeight={600}>
                {option.display_name.split(',')[0]}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {option.display_name}
            </Typography>
          </Box>
        </Box>
      )}
    />
  );
}
